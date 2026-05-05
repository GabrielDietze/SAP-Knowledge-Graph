import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTree, searchNodes, deleteNode, updateNode, createNode } from '../api';
import { NODE_TYPES } from './nodeConfig';
import ContextMenu from './ContextMenu';

const TYPE_ICONS = {
  pasta:           '📁',
  modulo:          '🗂️',
  area:            '📁',
  processo:        '📋',
  transacao:       '⚡',
  desenvolvimento: '🔧',
  cpi:             '🔗',
  btp:             '☁️',
  fiori:           '🎨',
  integracao:      '↔️',
  generic:         '📄',
};

function getNodeIcon(node, hasChildren, isOpen) {
  if (node.type === 'pasta') return isOpen ? '📂' : '📁';
  if (hasChildren) return isOpen ? '📂' : (TYPE_ICONS[node.type] || '📁');
  return TYPE_ICONS[node.type] || '📄';
}

function collectDescendants(node) {
  const ids = new Set([node.id]);
  (node.children || []).forEach(c => collectDescendants(c).forEach(id => ids.add(id)));
  return ids;
}

function sortNodes(nodes) {
  return [...nodes].sort((a, b) => {
    const aF = a.type === 'pasta' || (a.children && a.children.length > 0);
    const bF = b.type === 'pasta' || (b.children && b.children.length > 0);
    if (aF && !bF) return -1;
    if (!aF && bF) return 1;
    return a.title.localeCompare(b.title);
  });
}

function InlineInput({ value = '', icon = '📁', depth = 0, onSubmit, onCancel }) {
  const [val, setVal] = useState(value);
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const submit = () => { if (val.trim()) onSubmit(val.trim()); else onCancel(); };
  return (
    <div
      className="flex items-center gap-0"
      style={{ paddingLeft: `${depth * 12 + 4}px`, height: 22 }}
    >
      {Array.from({ length: depth }).map((_, i) => (
        <div key={i} className="absolute top-0 bottom-0 border-l border-[#2a3444]" style={{ left: `${i * 12 + 10}px` }} />
      ))}
      <span className="w-4 shrink-0" />
      <span className="text-[13px] mr-1 shrink-0">{icon}</span>
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={submit}
        className="flex-1 bg-[#1e3a5f] border border-blue-500 rounded px-1 text-[12px] text-slate-200 outline-none min-w-0"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

function TreeNode({
  node, depth,
  onNavigate, onEdit, onNewChild, onDelete,
  onMove, onRename, activeNodeId,
  draggingId, dragOverId, setDragging, setDragOver,
  excludedIds, pendingCreate, onCreateSubmit, onCreateCancel,
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isPasta = node.type === 'pasta';
  const [open, setOpen] = useState(isPasta ? depth < 3 : depth === 0);
  const [menu, setMenu] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(node.title);
  const renameRef = useRef();
  const rowRef = useRef();

  const isActive = node.id === activeNodeId;
  const isExcluded = excludedIds?.has(node.id);
  const isDragOver = dragOverId === node.id && !isExcluded;
  const isDragging = draggingId === node.id;
  const showPendingInside = pendingCreate?.parentId === node.id && open;

  const startRename = useCallback(() => {
    setRenameVal(node.title);
    setRenaming(true);
    setTimeout(() => { renameRef.current?.focus(); renameRef.current?.select(); }, 20);
  }, [node.title]);

  const submitRename = useCallback(() => {
    const v = renameVal.trim();
    if (v && v !== node.title) onRename(node.id, v);
    setRenaming(false);
  }, [renameVal, node, onRename]);

  const cancelRename = useCallback(() => {
    setRenameVal(node.title);
    setRenaming(false);
  }, [node.title]);

  // Auto-open when pendingCreate targets this node
  useEffect(() => {
    if (pendingCreate?.parentId === node.id) setOpen(true);
  }, [pendingCreate, node.id]);

  // F2 to rename active node
  useEffect(() => {
    if (!isActive) return;
    const handler = (e) => { if (e.key === 'F2') { e.preventDefault(); startRename(); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isActive, startRename]);

  const isFolderType = node.type === 'pasta' || node.type === 'area' || node.type === 'modulo';

  const handleClick = useCallback(() => {
    if (renaming) return;
    if (hasChildren || isPasta) setOpen(o => !o);
    if (!isFolderType) onNavigate(node.parent_id || null, node.id);
  }, [renaming, hasChildren, isPasta, isFolderType, node, onNavigate]);

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    if (hasChildren || isPasta) {
      onNavigate(node.id);
    } else {
      startRename();
    }
  }, [hasChildren, isPasta, node, onNavigate, startRename]);

  // Drag handlers
  const handleDragStart = useCallback((e) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
    setDragging(node.id, collectDescendants(node));
  }, [node, setDragging]);

  const handleDragEnd = useCallback(() => {
    setDragging(null, null);
    setDragOver(null);
  }, [setDragging, setDragOver]);

  const handleDragOver = useCallback((e) => {
    if (isExcluded) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(node.id);
    // Auto-open when hovering
    if ((hasChildren || isPasta) && !open) setOpen(true);
  }, [isExcluded, node.id, hasChildren, isPasta, open, setDragOver]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== node.id && !isExcluded) {
      onMove(draggedId, node.id);
    }
  }, [node.id, isExcluded, onMove, setDragOver]);

  const handleRightClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const menuItems = [
    { icon: '→', label: 'Abrir no grafo', action: () => onNavigate(node.parent_id || null, node.id) },
    (hasChildren || isPasta) && { icon: '↓', label: 'Entrar na pasta', action: () => onNavigate(node.id) },
    'separator',
    { icon: '✏️', label: 'Renomear', action: startRename },
    { icon: '⚙️', label: 'Editar detalhes', action: () => onEdit(node) },
    'separator',
    { icon: '📁', label: 'Nova pasta aqui', action: () => { setOpen(true); onNewChild(node.id, 'pasta'); } },
    { icon: '➕', label: 'Novo nó aqui', action: () => { setOpen(true); onNewChild(node.id); } },
    'separator',
    { icon: '🗑️', label: 'Deletar', danger: true, action: () => onDelete(node) },
  ].filter(Boolean);

  const icon = getNodeIcon(node, hasChildren, open);

  return (
    <>
      <div
        ref={rowRef}
        className={[
          'group flex items-center gap-0 select-none relative',
          renaming ? 'cursor-text' : 'cursor-pointer',
          isDragOver ? 'bg-[#2c4a7c] outline outline-1 outline-blue-500 outline-offset-[-1px]' : '',
          isActive && !isDragOver ? 'bg-[#37456b]' : '',
          !isActive && !isDragOver ? 'hover:bg-[#1e2d3d]' : '',
          isDragging ? 'opacity-40' : '',
        ].join(' ')}
        style={{ paddingLeft: `${depth * 12 + 4}px`, height: 22 }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleRightClick}
        draggable={!renaming}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Indentation lines */}
        {Array.from({ length: depth }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-[#2a3444]"
            style={{ left: `${i * 12 + 10}px` }}
          />
        ))}

        {/* Chevron */}
        <span className="w-4 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-slate-200">
          {(hasChildren || isPasta)
            ? <span className="text-[12px] font-bold">{open ? '▾' : '▸'}</span>
            : <span className="text-[12px] opacity-0">▸</span>
          }
        </span>

        {/* Icon */}
        <span className="text-[13px] mr-1 shrink-0 leading-none">{icon}</span>

        {/* Label or rename input */}
        {renaming ? (
          <input
            ref={renameRef}
            value={renameVal}
            onChange={e => setRenameVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') submitRename();
              if (e.key === 'Escape') cancelRename();
            }}
            onBlur={submitRename}
            className="flex-1 bg-[#1e3a5f] border border-blue-500 rounded px-1 text-[12px] text-slate-200 outline-none min-w-0"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className="text-[12px] truncate flex-1 leading-none"
            style={{ color: isActive ? '#c9d8ef' : '#b0bec5' }}
          >
            {node.title}
          </span>
        )}

        {/* Hover actions */}
        {!renaming && (
          <div className="flex items-center pr-1 opacity-0 group-hover:opacity-100 shrink-0">
            <button
              onClick={e => { e.stopPropagation(); setOpen(true); onNewChild(node.id, 'pasta'); }}
              className="w-4 h-4 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 hover:bg-[#2a3447] text-[11px]"
              title="Nova pasta aqui"
            >
              📁
            </button>
            <button
              onClick={e => { e.stopPropagation(); setOpen(true); onNewChild(node.id); }}
              className="w-4 h-4 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 hover:bg-[#2a3447] text-xs"
              title="Novo nó aqui"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {open && (
        <>
          {showPendingInside && (
            <InlineInput
              value=""
              icon={pendingCreate.type === 'pasta' ? '📁' : '📄'}
              depth={depth + 1}
              onSubmit={onCreateSubmit}
              onCancel={onCreateCancel}
            />
          )}
          {hasChildren && sortNodes(node.children).map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onNavigate={onNavigate}
              onEdit={onEdit}
              onNewChild={onNewChild}
              onDelete={onDelete}
              onMove={onMove}
              onRename={onRename}
              activeNodeId={activeNodeId}
              draggingId={draggingId}
              dragOverId={dragOverId}
              setDragging={setDragging}
              setDragOver={setDragOver}
              excludedIds={excludedIds}
              pendingCreate={pendingCreate}
              onCreateSubmit={onCreateSubmit}
              onCreateCancel={onCreateCancel}
            />
          ))}
        </>
      )}

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={menuItems}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}

export default function Sidebar({ onNavigate, onEdit, onNewChild, activeNodeId, refreshKey }) {
  const [tree, setTree] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [excludedIds, setExcludedIds] = useState(null);
  const [pendingCreate, setPendingCreate] = useState(null);
  const [menu, setMenu] = useState(null);
  const sidebarRef = useRef();

  const loadTree = useCallback(() => { getTree().then(setTree); }, []);
  useEffect(() => { loadTree(); }, [refreshKey, loadTree]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchNodes(search.trim());
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleMove = useCallback(async (draggedId, targetParentId) => {
    await updateNode(draggedId, { parent_id: targetParentId });
    loadTree();
  }, [loadTree]);

  const handleMoveToRoot = useCallback(async (draggedId) => {
    await updateNode(draggedId, { parent_id: null });
    loadTree();
  }, [loadTree]);

  const handleRename = useCallback(async (id, title) => {
    await updateNode(id, { title });
    loadTree();
  }, [loadTree]);

  const handleDelete = useCallback(async (node) => {
    const msg = node.children?.length > 0
      ? `Deletar "${node.title}" e todos os seus filhos?`
      : `Deletar "${node.title}"?`;
    if (!confirm(msg)) return;
    await deleteNode(node.id);
    loadTree();
    onNavigate(null);
  }, [loadTree, onNavigate]);

  const handleNewChild = useCallback((parentId, type) => {
    if (type === 'pasta') {
      setPendingCreate({ parentId: parentId ?? null, type: 'pasta' });
    } else {
      onNewChild(parentId);
    }
  }, [onNewChild]);

  const handleCreateSubmit = useCallback(async (title) => {
    if (!title || !pendingCreate) return;
    await createNode({ title, type: pendingCreate.type, parent_id: pendingCreate.parentId });
    setPendingCreate(null);
    loadTree();
  }, [pendingCreate, loadTree]);

  const handleCreateCancel = useCallback(() => setPendingCreate(null), []);

  const setDragging = useCallback((id, descendants) => {
    setDraggingId(id);
    setExcludedIds(descendants);
  }, []);

  // Sidebar background drag events (drop to root)
  const handleSidebarDragOver = useCallback((e) => {
    if (!draggingId) return;
    // Only if dragging over the sidebar container itself (not a child node)
    e.preventDefault();
    setDragOverId('root');
  }, [draggingId]);

  const handleSidebarDrop = useCallback((e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) handleMoveToRoot(id);
    setDraggingId(null);
    setDragOverId(null);
    setExcludedIds(null);
  }, [handleMoveToRoot]);

  const handleSidebarRightClick = useCallback((e) => {
    if (e.target !== sidebarRef.current) return;
    e.preventDefault();
    setMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { icon: '📁', label: 'Nova pasta', action: () => setPendingCreate({ parentId: null, type: 'pasta' }) },
        { icon: '➕', label: 'Novo nó raiz', action: () => onNewChild(null) },
      ],
    });
  }, [onNewChild]);

  const isDragOverRoot = dragOverId === 'root';

  return (
    <div
      ref={sidebarRef}
      className={`flex flex-col h-full bg-[#111827] border-r border-[#1e293b] w-64 shrink-0 ${isDragOverRoot ? 'bg-[#1a2a40]' : ''}`}
      onContextMenu={handleSidebarRightClick}
      onDragOver={handleSidebarDragOver}
      onDrop={handleSidebarDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e293b]">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          Explorador
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setPendingCreate({ parentId: null, type: 'pasta' })}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 hover:bg-[#1e293b] text-xs"
            title="Nova pasta (raiz)"
          >
            📁
          </button>
          <button
            onClick={() => onNewChild(null)}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 hover:bg-[#1e293b] text-sm"
            title="Novo nó (raiz)"
          >
            +
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-2 border-b border-[#1e293b]">
        <div className="flex items-center gap-1.5 bg-[#1e2d3d] border border-[#2a3444] rounded px-2 py-1">
          <span className="text-slate-600 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin py-1 relative">
        {/* Pending create at root level */}
        {pendingCreate?.parentId === null && (
          <InlineInput
            value=""
            icon={pendingCreate.type === 'pasta' ? '📁' : '📄'}
            depth={0}
            onSubmit={handleCreateSubmit}
            onCancel={handleCreateCancel}
          />
        )}

        {search.trim() ? (
          <>
            {searching && <div className="text-[11px] text-slate-600 px-4 py-2">Buscando...</div>}
            {!searching && searchResults.length === 0 && (
              <div className="text-[11px] text-slate-600 px-4 py-2">Nenhum resultado</div>
            )}
            {searchResults.map(n => (
              <div
                key={n.id}
                className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-[#1e2d3d]"
                onClick={() => onNavigate(n.parent_id || null, n.id)}
              >
                <span className="text-sm">{TYPE_ICONS[n.type] || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-slate-300 truncate">{n.title}</div>
                  <div className="text-[10px] text-slate-600">{NODE_TYPES[n.type]?.label || 'Genérico'}</div>
                </div>
              </div>
            ))}
          </>
        ) : (
          sortNodes(tree).map(node => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              onNavigate={onNavigate}
              onEdit={onEdit}
              onNewChild={handleNewChild}
              onDelete={handleDelete}
              onMove={handleMove}
              onRename={handleRename}
              activeNodeId={activeNodeId}
              draggingId={draggingId}
              dragOverId={dragOverId}
              setDragging={setDragging}
              setDragOver={setDragOverId}
              excludedIds={excludedIds}
              pendingCreate={pendingCreate}
              onCreateSubmit={handleCreateSubmit}
              onCreateCancel={handleCreateCancel}
            />
          ))
        )}

        {!search && tree.length === 0 && !pendingCreate && (
          <div className="text-[11px] text-slate-600 px-4 py-4 text-center">
            Nenhum item encontrado.<br />
            <button onClick={() => onNewChild(null)} className="text-blue-500 hover:underline mt-1">
              Criar o primeiro
            </button>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="border-t border-[#1e293b] px-3 py-1.5 flex items-center gap-2">
        <span className="text-[10px] text-slate-600">{tree.length} itens raiz</span>
        {draggingId && (
          <span className="ml-auto text-[10px] text-blue-400">Arrastando — solte na pasta destino</span>
        )}
        {!draggingId && (
          <span className="ml-auto text-[10px] text-slate-600">F2 renomear · drag p/ mover</span>
        )}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={menu.items}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
