const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const supabase = createClient(
  'https://fdstffpihuwlbbplwqdy.supabase.co',
  process.env.secret_key
);

async function run() {
  console.log('Verificando conexão...');
  const { error: testError } = await supabase.from('nodes').select('id').limit(1);
  if (testError) {
    console.error('Erro de conexão ou tabelas não existem:', testError.message);
    console.error('Crie as tabelas no SQL Editor do Supabase primeiro.');
    process.exit(1);
  }

  const { count } = await supabase.from('nodes').select('*', { count: 'exact', head: true });
  if (count > 0) {
    console.log(`Banco já tem ${count} nós, pulando migração.`);
    process.exit(0);
  }

  const jsonPath = path.join(__dirname, '../../data/knowledge.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('Nenhum knowledge.json encontrado.');
    process.exit(0);
  }

  const { nodes = [], edges = [] } = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  if (nodes.length === 0) { console.log('Sem dados para migrar.'); process.exit(0); }

  // Topological sort: parents before children
  const sorted = [];
  const visited = new Set();
  const nodeMap = {};
  nodes.forEach(n => (nodeMap[n.id] = n));

  const visit = (n) => {
    if (visited.has(n.id)) return;
    if (n.parent_id && nodeMap[n.parent_id]) visit(nodeMap[n.parent_id]);
    visited.add(n.id);
    sorted.push(n);
  };
  nodes.forEach(n => visit(n));

  console.log(`Migrando ${sorted.length} nós...`);
  // Insert in batches of 50
  for (let i = 0; i < sorted.length; i += 50) {
    const batch = sorted.slice(i, i + 50).map(n => ({
      id: n.id,
      title: n.title,
      type: n.type || 'generic',
      description: n.description || '',
      content: n.content || '',
      tags: n.tags || [],
      parent_id: n.parent_id || null,
      pos_x: n.pos_x || 0,
      pos_y: n.pos_y || 0,
      created_at: n.created_at || new Date().toISOString(),
      updated_at: n.updated_at || new Date().toISOString(),
    }));
    const { error } = await supabase.from('nodes').upsert(batch, { onConflict: 'id' });
    if (error) { console.error('Erro ao inserir nós:', error.message); process.exit(1); }
    console.log(`  ${Math.min(i + 50, sorted.length)}/${sorted.length} nós...`);
  }

  if (edges.length > 0) {
    console.log(`Migrando ${edges.length} conexões...`);
    const edgeData = edges.map(e => ({
      id: e.id, source: e.source, target: e.target,
      label: e.label || '', type: e.type || 'default',
      created_at: e.created_at || new Date().toISOString(),
    }));
    const { error } = await supabase.from('edges').upsert(edgeData, { onConflict: 'id' });
    if (error) { console.error('Erro ao inserir edges:', error.message); process.exit(1); }
  }

  console.log('Migração concluída!');
}

run().catch(e => { console.error('Erro:', e.message); process.exit(1); });
