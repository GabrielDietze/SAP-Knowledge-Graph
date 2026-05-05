import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { getNodeConfig } from './nodeConfig';

export default function CustomNode({ data, selected }) {
  const cfg = getNodeConfig(data.type);

  return (
    <div
      style={{
        background: cfg.bg,
        border: `2px solid ${selected ? '#fff' : cfg.border}`,
        borderRadius: 10,
        padding: '10px 16px',
        minWidth: 160,
        maxWidth: 220,
        boxShadow: selected
          ? `0 0 0 2px #fff, 0 0 20px ${cfg.color}88`
          : `0 0 12px ${cfg.color}44`,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: cfg.color, border: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: cfg.color,
            background: `${cfg.color}22`,
            padding: '1px 6px',
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {cfg.label}
        </span>
        {data.hasChildren && (
          <span
            style={{
              fontSize: 10,
              color: '#a0aec0',
              background: '#2d3748',
              padding: '1px 5px',
              borderRadius: 4,
            }}
          >
            ▼ expandir
          </span>
        )}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 5 }}>
        {data.type === 'pasta' && <span style={{ fontSize: 14 }}>📁</span>}
        {data.title}
      </div>

      {data.description && (
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
          {data.description.length > 60 ? data.description.slice(0, 60) + '…' : data.description}
        </div>
      )}

      {data.tags && data.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 6 }}>
          {data.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                color: '#64748b',
                background: '#0f172a',
                padding: '1px 5px',
                borderRadius: 3,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: cfg.color, border: 'none' }} />
    </div>
  );
}
