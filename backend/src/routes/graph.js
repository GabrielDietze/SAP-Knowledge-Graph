const express = require('express');
const router = express.Router();
const { supabase } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const { parent_id } = req.query;
    const [{ data: allNodes, error: e1 }, { data: allEdges, error: e2 }] = await Promise.all([
      supabase.from('nodes').select('*'),
      supabase.from('edges').select('*'),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;

    const scopeNodes = parent_id
      ? allNodes.filter(n => n.parent_id === parent_id)
      : allNodes.filter(n => !n.parent_id);

    const nodeIds = new Set(scopeNodes.map(n => n.id));

    const nodesWithMeta = scopeNodes.map(n => ({
      ...n,
      hasChildren: allNodes.some(c => c.parent_id === n.id),
    }));

    const edges = allEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    let breadcrumb = [];
    if (parent_id) {
      let current = allNodes.find(n => n.id === parent_id);
      while (current) {
        breadcrumb.unshift({ id: current.id, title: current.title, parent_id: current.parent_id });
        current = current.parent_id ? allNodes.find(n => n.id === current.parent_id) : null;
      }
    }

    res.json({ nodes: nodesWithMeta, edges, breadcrumb });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
