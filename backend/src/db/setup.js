const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.project_url,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Conectando ao Supabase...');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS nodes (
        id          TEXT PRIMARY KEY,
        title       TEXT NOT NULL,
        type        TEXT DEFAULT 'generic',
        content     TEXT DEFAULT '',
        description TEXT DEFAULT '',
        tags        TEXT[] DEFAULT '{}',
        parent_id   TEXT REFERENCES nodes(id) ON DELETE CASCADE,
        pos_x       FLOAT DEFAULT 0,
        pos_y       FLOAT DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Tabela nodes criada.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS edges (
        id         TEXT PRIMARY KEY,
        source     TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
        target     TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
        label      TEXT DEFAULT '',
        type       TEXT DEFAULT 'default',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Tabela edges criada.');

    // Check if there's existing data to migrate
    const jsonPath = path.join(__dirname, '../../data/knowledge.json');
    if (!fs.existsSync(jsonPath)) {
      console.log('Nenhum knowledge.json encontrado, setup concluído.');
      return;
    }

    const { nodes: existingCount } = await client.query('SELECT COUNT(*) as c FROM nodes').then(r => ({ nodes: parseInt(r.rows[0].c) }));
    if (existingCount > 0) {
      console.log(`Banco já tem ${existingCount} nós, pulando migração.`);
      return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const { nodes = [], edges = [] } = data;

    if (nodes.length === 0) {
      console.log('Nenhum dado para migrar.');
      return;
    }

    // Topological sort: insert parents before children
    const sorted = [];
    const visited = new Set();
    const nodeMap = {};
    nodes.forEach(n => (nodeMap[n.id] = n));

    const visit = (n) => {
      if (visited.has(n.id)) return;
      if (n.parent_id && nodeMap[n.parent_id] && !visited.has(n.parent_id)) {
        visit(nodeMap[n.parent_id]);
      }
      visited.add(n.id);
      sorted.push(n);
    };
    nodes.forEach(n => visit(n));

    console.log(`Migrando ${sorted.length} nós...`);
    for (const n of sorted) {
      await client.query(
        `INSERT INTO nodes (id, title, type, description, content, tags, parent_id, pos_x, pos_y, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO NOTHING`,
        [
          n.id,
          n.title,
          n.type || 'generic',
          n.description || '',
          n.content || '',
          n.tags || [],
          n.parent_id || null,
          n.pos_x || 0,
          n.pos_y || 0,
          n.created_at || new Date().toISOString(),
          n.updated_at || new Date().toISOString(),
        ]
      );
    }
    console.log(`${sorted.length} nós migrados.`);

    console.log(`Migrando ${edges.length} conexões...`);
    for (const e of edges) {
      await client.query(
        `INSERT INTO edges (id, source, target, label, type, created_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO NOTHING`,
        [e.id, e.source, e.target, e.label || '', e.type || 'default', e.created_at || new Date().toISOString()]
      );
    }
    console.log(`${edges.length} conexões migradas.`);
    console.log('Migração concluída com sucesso!');

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Erro no setup:', err.message);
  process.exit(1);
});
