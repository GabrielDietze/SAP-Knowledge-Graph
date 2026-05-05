const express = require('express');
const router = express.Router();
const { supabase, uuidv4 } = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('edges').select('*');
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { source, target, label = '', type = 'default' } = req.body;
    if (!source || !target) return res.status(400).json({ error: 'source and target are required' });
    const edge = { id: uuidv4(), source, target, label, type };
    const { data, error } = await supabase.from('edges').insert(edge).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { label, type } = req.body;
    const { data, error } = await supabase.from('edges').update({ label, type }).eq('id', req.params.id).select().single();
    if (error) return res.status(404).json({ error: 'Edge not found' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('edges').delete().eq('id', req.params.id);
    if (error) return res.status(404).json({ error: 'Edge not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
