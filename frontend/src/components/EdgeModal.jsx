import React, { useState } from 'react';
import { createEdge } from '../api';

export default function EdgeModal({ nodes, onSave, onClose }) {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [label, setLabel] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source || !target || source === target) return;
    await createEdge({ source, target, label });
    onSave();
  };

  const inputCls = 'w-full bg-[#0a1628] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/60';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1929] border border-[#1e293b] rounded-xl w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#1e293b]">
          <h2 className="text-base font-semibold text-slate-200">Nova conexão</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">De (origem)</label>
            <select className={inputCls} value={source} onChange={e => setSource(e.target.value)} required>
              <option value="">Selecione...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Para (destino)</label>
            <select className={inputCls} value={target} onChange={e => setTarget(e.target.value)} required>
              <option value="">Selecione...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Rótulo da conexão</label>
            <input
              className={inputCls}
              placeholder="usa / depende de / gera / implementa"
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
              Criar conexão
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[#1e293b] text-slate-300 text-sm rounded-lg">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
