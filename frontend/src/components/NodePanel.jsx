import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getNodeConfig } from './nodeConfig';
import { deleteNode, deleteEdge } from '../api';

export default function NodePanel({ node, edges, onClose, onEdit, onRefresh, onNavigate }) {
  if (!node) return null;

  const cfg = getNodeConfig(node.type);
  const outgoing = edges.filter(e => e.source === node.id);
  const incoming = edges.filter(e => e.target === node.id);

  const handleDelete = async () => {
    if (!confirm(`Deletar "${node.title}"? Isso também removerá todos os filhos.`)) return;
    await deleteNode(node.id);
    onClose();
    onRefresh();
  };

  const handleDeleteEdge = async (edgeId) => {
    await deleteEdge(edgeId);
    onRefresh();
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1929] border-l border-[#1e293b] w-80 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
        <span
          className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wide"
          style={{ color: cfg.color, background: `${cfg.color}22` }}
        >
          {cfg.label}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(node)}
            className="text-xs px-2 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-300"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="text-xs px-2 py-1 rounded bg-red-900/40 hover:bg-red-900/60 text-red-400"
          >
            Deletar
          </button>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 ml-1">✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-slate-100">{node.title}</h2>
          {node.description && (
            <p className="text-sm text-slate-400 mt-1">{node.description}</p>
          )}
        </div>

        {/* Tags */}
        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {node.tags.map(tag => (
              <span key={tag} className="text-xs bg-[#1e293b] text-slate-400 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content (markdown) */}
        {node.content && (
          <div className="prose prose-invert prose-sm max-w-none border border-[#1e293b] rounded-lg p-3 bg-[#0a1628]">
            <ReactMarkdown>{node.content}</ReactMarkdown>
          </div>
        )}

        {/* Navigate into children */}
        {node.hasChildren && (
          <button
            onClick={() => onNavigate(node.id)}
            className="w-full py-2 text-sm rounded-lg border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-colors"
          >
            ▼ Abrir filhos de "{node.title}"
          </button>
        )}

        {/* Connections */}
        {(outgoing.length > 0 || incoming.length > 0) && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Conexões</h3>
            {incoming.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-slate-600 mb-1">← Recebe de</div>
                {incoming.map(e => (
                  <div key={e.id} className="flex items-center justify-between group py-1">
                    <span className="text-xs text-slate-400">{e.label || 'conectado'}</span>
                    <button
                      onClick={() => handleDeleteEdge(e.id)}
                      className="text-xs text-red-500/40 hover:text-red-400 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {outgoing.length > 0 && (
              <div>
                <div className="text-xs text-slate-600 mb-1">→ Aponta para</div>
                {outgoing.map(e => (
                  <div key={e.id} className="flex items-center justify-between group py-1">
                    <span className="text-xs text-slate-400">{e.label || 'conectado'}</span>
                    <button
                      onClick={() => handleDeleteEdge(e.id)}
                      className="text-xs text-red-500/40 hover:text-red-400 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-slate-600 border-t border-[#1e293b] pt-3">
          <div>ID: <span className="font-mono">{node.id.slice(0, 8)}…</span></div>
          {node.created_at && <div>Criado: {new Date(node.created_at).toLocaleDateString('pt-BR')}</div>}
          {node.updated_at && <div>Atualizado: {new Date(node.updated_at).toLocaleDateString('pt-BR')}</div>}
        </div>
      </div>
    </div>
  );
}
