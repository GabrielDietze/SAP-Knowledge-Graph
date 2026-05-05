import React, { useState, useEffect } from 'react';
import { NODE_TYPES } from './nodeConfig';
import { createNode, updateNode } from '../api';

export default function NodeEditor({ node, parentId, onSave, onClose }) {
  const isEdit = !!node;
  const [form, setForm] = useState({
    title: '',
    type: 'processo',
    description: '',
    content: '',
    tags: '',
    parent_id: parentId || null,
  });

  useEffect(() => {
    if (node) {
      setForm({
        title: node.title || '',
        type: node.type || 'processo',
        description: node.description || '',
        content: node.content || '',
        tags: Array.isArray(node.tags) ? node.tags.join(', ') : '',
        parent_id: node.parent_id || null,
      });
    }
  }, [node]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      parent_id: form.parent_id || null,
    };
    if (isEdit) {
      await updateNode(node.id, payload);
    } else {
      await createNode(payload);
    }
    onSave();
  };

  const inputCls = 'w-full bg-[#0a1628] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/60';
  const labelCls = 'block text-xs font-medium text-slate-500 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1929] border border-[#1e293b] rounded-xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#1e293b]">
          <h2 className="text-base font-semibold text-slate-200">
            {isEdit ? 'Editar nó' : 'Novo nó'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Título *</label>
            <input
              className={inputCls}
              placeholder="Ex: Processo de Remessa"
              value={form.title}
              onChange={set('title')}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tipo</label>
              <select className={inputCls} value={form.type} onChange={set('type')}>
                {Object.entries(NODE_TYPES).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tags (vírgula)</label>
              <input
                className={inputCls}
                placeholder="VL01N, remessa, SD"
                value={form.tags}
                onChange={set('tags')}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Descrição curta</label>
            <input
              className={inputCls}
              placeholder="Uma linha explicando o nó"
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div>
            <label className={labelCls}>Conteúdo (Markdown)</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={6}
              placeholder={`## Como funciona\n\nDescreva aqui com markdown...\n\n- Passo 1\n- Passo 2`}
              value={form.content}
              onChange={set('content')}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isEdit ? 'Salvar alterações' : 'Criar nó'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-sm rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
