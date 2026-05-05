const express = require('express');
const router = express.Router();
const { supabase, uuidv4 } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const { parent_id, root } = req.query;
    let query = supabase.from('nodes').select('*').order('title');
    if (root === 'true') query = query.is('parent_id', null);
    else if (parent_id) query = query.eq('parent_id', parent_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/tree', async (req, res) => {
  try {
    const { data, error } = await supabase.from('nodes').select('*').order('title');
    if (error) throw error;
    const map = {};
    data.forEach(n => (map[n.id] = { ...n, children: [] }));
    const roots = [];
    data.forEach(n => {
      if (n.parent_id && map[n.parent_id]) map[n.parent_id].children.push(map[n.id]);
      else if (!n.parent_id) roots.push(map[n.id]);
    });
    res.json(roots);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const { data, error } = await supabase.from('nodes').select('*')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(50);
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('nodes').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Node not found' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, type = 'generic', description = '', content = '', tags = [], parent_id = null, pos_x = 0, pos_y = 0 } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const node = { id: uuidv4(), title, type, description, content, tags, parent_id: parent_id || null, pos_x, pos_y };
    const { data, error } = await supabase.from('nodes').insert(node).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    if (updates.parent_id === '') updates.parent_id = null;
    const { data, error } = await supabase.from('nodes').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(404).json({ error: 'Node not found' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('nodes').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ error: 'Node not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
