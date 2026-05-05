export const NODE_TYPES = {
  pasta:        { label: 'Pasta',          color: '#dcb862', bg: '#2f2600', border: '#dcb862' },
  modulo:       { label: 'Módulo',         color: '#3b82f6', bg: '#1e3a5f', border: '#3b82f6' },
  area:         { label: 'Área',           color: '#8b5cf6', bg: '#2d1b69', border: '#8b5cf6' },
  processo:     { label: 'Processo',       color: '#10b981', bg: '#064e3b', border: '#10b981' },
  transacao:    { label: 'Transação',      color: '#f59e0b', bg: '#451a03', border: '#f59e0b' },
  desenvolvimento: { label: 'Dev ABAP',   color: '#ef4444', bg: '#450a0a', border: '#ef4444' },
  cpi:          { label: 'CPI/Integration',color: '#06b6d4', bg: '#0c4a6e', border: '#06b6d4' },
  btp:          { label: 'BTP',           color: '#0ea5e9', bg: '#0c3547', border: '#0ea5e9' },
  fiori:        { label: 'Fiori/UI5',     color: '#d946ef', bg: '#4a044e', border: '#d946ef' },
  integracao:   { label: 'Integração',    color: '#eab308', bg: '#422006', border: '#eab308' },
  generic:      { label: 'Genérico',      color: '#6b7280', bg: '#1f2937', border: '#6b7280' },
};

export const getNodeConfig = (type) => NODE_TYPES[type] || NODE_TYPES.generic;
