import React, { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const keyHandler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  // Adjust position so menu doesn't overflow viewport
  const menuWidth = 200;
  const menuHeight = items.length * 32 + 8;
  const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
  const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

  return (
    <div
      ref={ref}
      style={{ top: adjustedY, left: adjustedX }}
      className="fixed z-[9999] min-w-[180px] bg-[#1c2333] border border-[#2d3748] rounded-md shadow-2xl py-1 select-none"
    >
      {items.map((item, i) =>
        item === 'separator' ? (
          <div key={i} className="my-1 border-t border-[#2d3748]" />
        ) : (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            disabled={item.disabled}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors
              ${item.danger
                ? 'text-red-400 hover:bg-red-500/15'
                : 'text-slate-300 hover:bg-[#2a3447]'}
              ${item.disabled ? 'opacity-40 cursor-default' : 'cursor-pointer'}
            `}
          >
            <span className="text-base leading-none w-4 text-center">{item.icon}</span>
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="ml-auto text-slate-600 text-[10px]">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}
