import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import { updateNode } from '../api';
import { uploadFile } from '../lib/upload';
import MarkdownRenderer, { mdComponents } from './MarkdownRenderer';

const TYPE_ICONS = {
  pasta: '📁', modulo: '🗂️', area: '📁', processo: '📋',
  transacao: '⚡', desenvolvimento: '🔧', cpi: '🔗', btp: '☁️',
  fiori: '🎨', integracao: '↔️', generic: '📄',
};

let _paneCounter = 1;
const genPaneId = () => `pane-${_paneCounter++}`;

// ─── Single pane ─────────────────────────────────────────────────────────────

function EditorPane({
  paneId, tabs, activeTabId, focused,
  onTabClick, onTabClose, onEdit, onContentSaved,
  onSplit, onFocus,
  draggingTab, onDragStart, onDragEnd,
  onDropOnTabBar, onDropOnZone,
  showRightZone, canSplit,
}) {
  const [editing, setEditing]       = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [tabBarOver, setTabBarOver] = useState(false);
  const [zoneOver, setZoneOver]     = useState(false);
  const fileInputRef  = useRef(null);
  const editorApiRef  = useRef(null);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const { url, name, mimeType } = await uploadFile(file, activeTab?.id ?? 'general');
      const isImage = mimeType.startsWith('image/');
      const md = isImage ? `![${name}](${url})` : `[${name}](${url})`;
      if (editorApiRef.current) {
        editorApiRef.current.replaceSelection(md);
      } else {
        setEditContent(prev => prev + '\n' + md);
      }
    } catch (err) {
      alert('Erro ao fazer upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [activeTab?.id]);

  const uploadCommand = useMemo(() => ({
    name: 'upload-file',
    keyCommand: 'upload-file',
    buttonProps: { 'aria-label': 'Anexar arquivo', title: 'Anexar arquivo (imagem, PDF, XML…)' },
    icon: (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a.5.5 0 0 1 .5.5v7.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 9.293V1.5A.5.5 0 0 1 8 1z"/>
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.1a.5.5 0 0 1 1 0v2.1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.1a.5.5 0 0 1 .5-.5z"/>
      </svg>
    ),
    execute: (_state, api) => {
      editorApiRef.current = api;
      fileInputRef.current?.click();
    },
  }), []);

  // reset editor when switching tabs
  useEffect(() => {
    setEditing(false);
    setEditContent(activeTab?.content ?? '');
  }, [activeTabId]);

  // keep editContent fresh when content is updated externally
  useEffect(() => {
    if (!editing) setEditContent(activeTab?.content ?? '');
  }, [activeTab?.content, editing]);

  const startEdit   = () => { setEditContent(activeTab?.content ?? ''); setEditing(true); };
  const cancelEdit  = () => setEditing(false);

  const handleSave = useCallback(async () => {
    if (!activeTab || saving) return;
    setSaving(true);
    try {
      await updateNode(activeTab.id, { content: editContent });
      onContentSaved(activeTab.id, editContent);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [activeTab, editContent, saving, onContentSaved]);

  useEffect(() => {
    if (!editing) return;
    const h = (e) => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSave(); }
      if (e.key === 'Escape') cancelEdit();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [editing, handleSave]);

  // Paste image from clipboard
  useEffect(() => {
    if (!editing) return;
    const handlePaste = async (e) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find(item => item.kind === 'file' && item.type.startsWith('image/'));
      if (!imageItem) return;
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;
      setUploading(true);
      try {
        const { url, name } = await uploadFile(file, activeTab?.id ?? 'general');
        setEditContent(prev => prev + `\n![${name}](${url})`);
      } catch (err) {
        alert('Erro ao fazer upload: ' + err.message);
      } finally {
        setUploading(false);
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [editing, activeTab?.id]);

  const handleFileDrop = useCallback(async (e) => {
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    e.preventDefault();
    setUploading(true);
    try {
      for (const file of files) {
        const { url, name, mimeType } = await uploadFile(file, activeTab?.id ?? 'general');
        const isImage = mimeType.startsWith('image/');
        setEditContent(prev => prev + `\n${isImage ? `![${name}](${url})` : `[${name}](${url})`}`);
      }
    } catch (err) {
      alert('Erro ao fazer upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [activeTab?.id]);

  const isDraggingFromHere = draggingTab?.sourcePaneId === paneId;

  return (
    <div
      className={`flex flex-col h-full flex-1 min-w-0 relative ${
        focused ? 'ring-1 ring-inset ring-blue-500/20' : ''
      }`}
      onClick={onFocus}
    >
      {/* ── Tab bar ── */}
      <div
        className={`flex bg-[#0f1929] border-b overflow-x-auto shrink-0 scrollbar-thin transition-colors ${
          tabBarOver && draggingTab && !isDraggingFromHere
            ? 'border-blue-500 bg-[#1a2a40]'
            : 'border-[#1e293b]'
        }`}
        style={{ minHeight: 36 }}
        onDragOver={e => {
          if (!draggingTab || isDraggingFromHere) return;
          e.preventDefault();
          setTabBarOver(true);
        }}
        onDragLeave={() => setTabBarOver(false)}
        onDrop={e => {
          e.preventDefault();
          setTabBarOver(false);
          if (draggingTab && !isDraggingFromHere)
            onDropOnTabBar(draggingTab.tabId, draggingTab.sourcePaneId, paneId);
        }}
      >
        {tabs.length === 0 ? (
          <div className="flex items-center px-4 text-[11px] text-slate-600 italic select-none">
            Nenhum arquivo aberto
          </div>
        ) : (
          tabs.map(tab => {
            const isActive   = tab.id === activeTabId;
            const isDragging = draggingTab?.tabId === tab.id;
            return (
              <div
                key={tab.id}
                draggable
                onDragStart={e => { e.stopPropagation(); onDragStart({ tabId: tab.id, sourcePaneId: paneId }); }}
                onDragEnd={e => { e.stopPropagation(); onDragEnd(); }}
                className={[
                  'group relative flex items-center gap-1.5 px-3 text-[12px]',
                  'border-r border-[#1e293b] cursor-pointer shrink-0 select-none transition-colors',
                  isActive
                    ? 'bg-[#1a1a2e] text-slate-200'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-[#141d2b]',
                  isDragging ? 'opacity-40' : '',
                ].join(' ')}
                style={{
                  height: 36,
                  borderTop: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                }}
                onClick={e => { e.stopPropagation(); onTabClick(tab.id, paneId); }}
              >
                <span className="text-[11px]">{TYPE_ICONS[tab.type] || '📄'}</span>
                <span className="max-w-[140px] truncate">{tab.title}</span>
                <button
                  onClick={e => { e.stopPropagation(); onTabClose(tab.id, paneId); }}
                  className={[
                    'w-4 h-4 flex items-center justify-center rounded text-[9px] shrink-0',
                    'hover:bg-[#2a3447] hover:text-red-400 transition-colors',
                    isActive ? 'opacity-50 hover:opacity-100' : 'opacity-0 group-hover:opacity-100',
                  ].join(' ')}
                >
                  ✕
                </button>
              </div>
            );
          })
        )}

        {/* Split button */}
        {canSplit && activeTab && !editing && (
          <button
            title="Dividir editor (abrir ao lado)"
            onClick={e => { e.stopPropagation(); onSplit(paneId); }}
            className="ml-auto mr-1 self-center px-2 h-6 flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-200 hover:bg-[#1e293b] rounded shrink-0 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="14" rx="1" opacity=".6"/>
              <rect x="9" y="1" width="6" height="14" rx="1"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {!activeTab ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 select-none">
          <div className="text-5xl mb-4 opacity-20">📝</div>
          <div className="text-sm">Abra um arquivo pela sidebar</div>
          <div className="text-xs mt-1 opacity-50">Clique em qualquer nó para abrir</div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* file header */}
          <div className="flex items-center justify-between px-5 py-2 border-b border-[#1e293b] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{TYPE_ICONS[activeTab.type] || '📄'}</span>
              <span className="text-sm font-semibold text-slate-200 truncate">{activeTab.title}</span>
              {activeTab.description && (
                <span className="text-[11px] text-slate-500 truncate hidden lg:block">
                  — {activeTab.description}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              {editing ? (
                <>
                  <span className="text-[10px] text-slate-600 mr-1 hidden sm:block">Ctrl+S · Esc</span>
                  <button onClick={cancelEdit} className="text-xs px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-slate-200 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving} className="text-xs px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50">
                    {saving ? 'Salvando…' : 'Salvar'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={startEdit} className="text-xs px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-slate-200 transition-colors">
                    ✎ Editar
                  </button>
                  <button onClick={() => onEdit(activeTab)} className="text-xs px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-slate-200 transition-colors" title="Editar metadados">
                    ⚙ Metadados
                  </button>
                </>
              )}
            </div>
          </div>

          {/* editor / viewer */}
          <div className="flex-1 overflow-hidden">
            {editing ? (
              <div
                data-color-mode="dark"
                className="h-full flex flex-col"
                onDragOver={e => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); e.stopPropagation(); } }}
                onDrop={handleFileDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {uploading && (
                  <div className="px-4 py-1.5 text-xs text-blue-300 bg-blue-950/40 border-b border-blue-900/40 shrink-0">
                    Fazendo upload…
                  </div>
                )}
                <MDEditor
                  value={editContent}
                  onChange={v => setEditContent(v ?? '')}
                  preview="live"
                  visibleDragbar={false}
                  style={{ flex: 1, height: '100%' }}
                  height="100%"
                  extraCommands={[uploadCommand, commands.divider, commands.fullscreen]}
                  previewOptions={{ remarkPlugins: [remarkGfm], components: mdComponents }}
                />
              </div>
            ) : (
              <div className="h-full overflow-y-auto scrollbar-thin">
                {activeTab.content ? (
                  <div className="markdown-content px-10 py-8" style={{ maxWidth: 800 }}>
                    <MarkdownRenderer content={activeTab.content} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center select-none">
                    <div className="text-4xl mb-3 opacity-30">📄</div>
                    <div className="text-slate-500 text-sm">Arquivo vazio</div>
                    <button onClick={startEdit} className="mt-3 text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                      Começar a escrever
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* tags footer */}
          {!editing && activeTab.tags?.length > 0 && (
            <div className="flex items-center gap-1.5 px-5 py-2 border-t border-[#1e293b] shrink-0">
              <span className="text-[10px] text-slate-600">tags:</span>
              {activeTab.tags.map(tag => (
                <span key={tag} className="text-[10px] text-slate-500 bg-[#1e293b] px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Right drop zone (split target) ── */}
      {showRightZone && (
        <div
          className={`absolute inset-y-0 right-0 w-2/5 z-20 flex items-center justify-center transition-all ${
            zoneOver
              ? 'bg-blue-500/25 border-l-2 border-blue-400'
              : 'bg-blue-500/8 border-l-2 border-blue-500/30'
          }`}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); setZoneOver(true); }}
          onDragLeave={() => setZoneOver(false)}
          onDrop={e => {
            e.preventDefault();
            e.stopPropagation();
            setZoneOver(false);
            if (draggingTab) onDropOnZone(draggingTab.tabId, draggingTab.sourcePaneId, paneId);
          }}
        >
          <span className={`text-xs font-medium px-2 py-1 rounded border pointer-events-none transition-colors ${
            zoneOver
              ? 'text-blue-200 bg-[#0f1929] border-blue-400'
              : 'text-blue-400/70 bg-[#0f1929]/80 border-blue-500/30'
          }`}>
            Abrir ao lado
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Multi-pane container ─────────────────────────────────────────────────────

export default function EditorArea({ tabs, activeTabId, onTabClick, onTabClose, onEdit, onContentSaved }) {
  const [panes, setPanes] = useState([{ id: 'pane-main', tabIds: [], activeTabId: null }]);
  const [focusedPaneId, setFocusedPaneId] = useState('pane-main');
  const [draggingTab, setDraggingTab] = useState(null);

  // keep a ref so effects can read latest without stale closure
  const focusedPaneRef = useRef('pane-main');
  useEffect(() => { focusedPaneRef.current = focusedPaneId; }, [focusedPaneId]);

  // ── Sync tabs prop → panes ──────────────────────────────────────────────
  useEffect(() => {
    setPanes(prev => {
      const allIds     = new Set(prev.flatMap(p => p.tabIds));
      const currentIds = new Set(tabs.map(t => t.id));

      const removed = [...allIds].filter(id => !currentIds.has(id));
      const added   = tabs.filter(t => !allIds.has(t.id)).map(t => t.id);

      if (removed.length === 0 && added.length === 0) return prev;

      let next = prev.map(p => {
        const tabIds = p.tabIds.filter(id => !removed.includes(id));
        let active   = p.activeTabId;
        if (removed.includes(active)) {
          const idx = p.tabIds.indexOf(active);
          active = tabIds[idx] ?? tabIds[idx - 1] ?? tabIds[0] ?? null;
        }
        return { ...p, tabIds, activeTabId: active };
      });

      // remove empty panes, keep at least one
      next = next.filter(p => p.tabIds.length > 0);
      if (next.length === 0) next = [{ id: genPaneId(), tabIds: [], activeTabId: null }];

      // add new tabs to focused pane
      if (added.length > 0) {
        const fpId = focusedPaneRef.current;
        const target = next.find(p => p.id === fpId) ?? next[next.length - 1];
        target.tabIds     = [...target.tabIds, ...added];
        target.activeTabId = added[added.length - 1];
      }

      return next;
    });
  }, [tabs]);

  // ── When Home.jsx's activeTabId changes (sidebar click) → focus right pane ──
  useEffect(() => {
    if (!activeTabId) return;
    setPanes(prev => {
      const pane = prev.find(p => p.tabIds.includes(activeTabId));
      if (!pane || pane.activeTabId === activeTabId) return prev;
      setFocusedPaneId(pane.id);
      return prev.map(p => p.id === pane.id ? { ...p, activeTabId } : p);
    });
  }, [activeTabId]);

  // ── Tab click inside a pane ────────────────────────────────────────────
  const handleTabClick = useCallback((tabId, paneId) => {
    setFocusedPaneId(paneId);
    setPanes(prev => prev.map(p => p.id === paneId ? { ...p, activeTabId: tabId } : p));
    onTabClick(tabId);
  }, [onTabClick]);

  // ── Tab close ──────────────────────────────────────────────────────────
  const handleTabClose = useCallback((tabId) => {
    onTabClose(tabId); // Home.jsx removes from tabs → panes effect cleans up
  }, [onTabClose]);

  // ── Split: move active tab of pane to a new right pane ────────────────
  const handleSplit = useCallback((sourcePaneId) => {
    const sourcePane = panes.find(p => p.id === sourcePaneId);
    if (!sourcePane?.activeTabId) return;

    const tabId = sourcePane.activeTabId;
    const newId = genPaneId();

    setPanes(prev => {
      const next = prev.map(p => {
        if (p.id !== sourcePaneId) return p;
        const remaining = p.tabIds.filter(id => id !== tabId);
        return { ...p, tabIds: remaining, activeTabId: remaining[remaining.length - 1] ?? null };
      }).filter(p => p.tabIds.length > 0);

      const insertAt = next.findIndex(p => p.id === sourcePaneId) + 1;
      next.splice(Math.max(insertAt, 1), 0, { id: newId, tabIds: [tabId], activeTabId: tabId });
      return next;
    });
    setFocusedPaneId(newId);
  }, [panes]);

  // ── Drop tab ON another pane's tab bar (move) ─────────────────────────
  const handleDropOnTabBar = useCallback((tabId, srcPaneId, dstPaneId) => {
    if (srcPaneId === dstPaneId) return;
    setPanes(prev => {
      let next = prev.map(p => {
        if (p.id === srcPaneId) {
          const remaining = p.tabIds.filter(id => id !== tabId);
          return { ...p, tabIds: remaining, activeTabId: remaining[remaining.length - 1] ?? null };
        }
        if (p.id === dstPaneId) {
          return { ...p, tabIds: [...p.tabIds, tabId], activeTabId: tabId };
        }
        return p;
      }).filter(p => p.tabIds.length > 0);
      if (next.length === 0) next = [{ id: genPaneId(), tabIds: [], activeTabId: null }];
      return next;
    });
    setFocusedPaneId(dstPaneId);
  }, []);

  // ── Drop tab ON right zone of a pane (split to right of that pane) ────
  const handleDropOnZone = useCallback((tabId, srcPaneId, rightOfPaneId) => {
    const newId = genPaneId();
    setPanes(prev => {
      const next = prev.map(p => {
        if (p.id !== srcPaneId) return p;
        const remaining = p.tabIds.filter(id => id !== tabId);
        return { ...p, tabIds: remaining, activeTabId: remaining[remaining.length - 1] ?? null };
      }).filter(p => p.tabIds.length > 0);

      const insertAt = next.findIndex(p => p.id === rightOfPaneId) + 1;
      next.splice(Math.max(insertAt, 1), 0, { id: newId, tabIds: [tabId], activeTabId: tabId });
      return next;
    });
    setFocusedPaneId(newId);
  }, []);

  return (
    <div className="flex h-full bg-[#1a1a2e] overflow-hidden">
      {panes.map((pane, idx) => {
        const paneTabs    = tabs.filter(t => pane.tabIds.includes(t.id));
        const isLastPane  = idx === panes.length - 1;
        // show the split drop zone only on the last pane while dragging
        const showZone    = !!draggingTab && isLastPane && pane.tabIds.length > 0;

        return (
          <React.Fragment key={pane.id}>
            {idx > 0 && (
              <div className="w-px bg-[#1e293b] shrink-0" />
            )}
            <EditorPane
              paneId={pane.id}
              tabs={paneTabs}
              activeTabId={pane.activeTabId}
              focused={pane.id === focusedPaneId}
              onTabClick={handleTabClick}
              onTabClose={handleTabClose}
              onEdit={onEdit}
              onContentSaved={onContentSaved}
              onSplit={handleSplit}
              onFocus={() => setFocusedPaneId(pane.id)}
              draggingTab={draggingTab}
              onDragStart={setDraggingTab}
              onDragEnd={() => setDraggingTab(null)}
              onDropOnTabBar={handleDropOnTabBar}
              onDropOnZone={handleDropOnZone}
              showRightZone={showZone}
              canSplit={panes.length < 3}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
