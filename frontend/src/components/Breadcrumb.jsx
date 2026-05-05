import React from 'react';

export default function Breadcrumb({ breadcrumb, onNavigate }) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-[#0f1929] border-b border-[#1e293b] text-sm overflow-x-auto">
      <button
        onClick={() => onNavigate(null)}
        className="text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap"
      >
        Raiz
      </button>
      {breadcrumb.map((crumb, i) => (
        <React.Fragment key={crumb.id}>
          <span className="text-slate-600 mx-1">/</span>
          {i === breadcrumb.length - 1 ? (
            <span className="text-slate-300 font-medium whitespace-nowrap">{crumb.title}</span>
          ) : (
            <button
              onClick={() => onNavigate(crumb.id)}
              className="text-blue-400 hover:text-blue-300 whitespace-nowrap"
            >
              {crumb.title}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
