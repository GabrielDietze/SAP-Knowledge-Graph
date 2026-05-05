import React, { useState, useEffect, useCallback } from 'react';
import { getNode, getNodes } from '../api';
import { supabase } from '../lib/supabase';
import EditorArea from '../components/EditorArea';
import Sidebar from '../components/Sidebar';
import NodeEditor from '../components/NodeEditor';
import EdgeModal from '../components/EdgeModal';

export default function Home() {
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [editorNode, setEditorNode] = useState(null);
  const [editorParentId, setEditorParentId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const [allNodes, setAllNodes] = useState([]);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  useEffect(() => { getNodes().then(setAllNodes); }, [showEdgeModal]);

  const openTab = useCallback(async (nodeId) => {
    if (openTabs.some(t => t.id === nodeId)) {
      setActiveTabId(nodeId);
      return;
    }
    try {
      const node = await getNode(nodeId);
      setOpenTabs(prev => {
        if (prev.some(t => t.id === nodeId)) return prev;
        return [...prev, {
          id: node.id,
          title: node.title,
          type: node.type,
          content: node.content || '',
          tags: node.tags || [],
          description: node.description || '',
          parent_id: node.parent_id || null,
        }];
      });
      setActiveTabId(nodeId);
    } catch (e) {
      console.error('Failed to open tab:', e);
    }
  }, [openTabs]);

  const closeTab = useCallback((tabId) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        const idx = prev.findIndex(t => t.id === tabId);
        const next = newTabs[idx] ?? newTabs[idx - 1] ?? null;
        setActiveTabId(next?.id ?? null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const handleContentSaved = useCallback((nodeId, content) => {
    setOpenTabs(prev => prev.map(t => t.id === nodeId ? { ...t, content } : t));
  }, []);

  const handleNavigate = useCallback((pid, selectId = null) => {
    const targetId = selectId ?? pid;
    if (targetId) openTab(targetId);
  }, [openTab]);

  const handleRefresh = useCallback(() => {
    getNodes().then(setAllNodes);
    setSidebarRefreshKey(k => k + 1);
    openTabs.forEach(async tab => {
      try {
        const node = await getNode(tab.id);
        setOpenTabs(prev => prev.map(t =>
          t.id === tab.id
            ? { ...t, title: node.title, type: node.type, content: node.content || '', tags: node.tags || [], description: node.description || '' }
            : t
        ));
      } catch {}
    });
  }, [openTabs]);

  const openNewNode = useCallback((forcedParentId = undefined) => {
    setEditorNode(null);
    setEditorParentId(forcedParentId !== undefined ? forcedParentId : null);
    setShowEditor(true);
  }, []);

  const openEditNode = useCallback((node) => {
    setEditorNode(node);
    setEditorParentId(node.parent_id || null);
    setShowEditor(true);
  }, []);

  const handleEditorSave = useCallback(() => {
    setShowEditor(false);
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className="flex flex-col h-screen bg-[#1a1a2e] overflow-hidden">
      {/* Topbar */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#0f1929] border-b border-[#1e293b] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-semibold text-slate-200 text-sm">SAP Knowledge Graph</span>
          </div>
          {openTabs.length > 0 && (
            <span className="text-xs text-slate-600 bg-[#1e293b] px-2 py-0.5 rounded">
              {openTabs.length} {openTabs.length === 1 ? 'arquivo' : 'arquivos'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEdgeModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-400 hover:text-slate-200 transition-colors"
          >
            + Conexão
          </button>
          <button
            onClick={() => openNewNode()}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            + Novo nó
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-500 hover:text-slate-300 transition-colors"
            title="Sair"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNavigate={handleNavigate}
          onEdit={openEditNode}
          onNewChild={openNewNode}
          activeNodeId={activeTabId}
          refreshKey={sidebarRefreshKey}
        />

        <div className="flex-1 overflow-hidden">
          <EditorArea
            tabs={openTabs}
            activeTabId={activeTabId}
            onTabClick={setActiveTabId}
            onTabClose={closeTab}
            onEdit={openEditNode}
            onContentSaved={handleContentSaved}
          />
        </div>
      </div>

      {/* Modals */}
      {showEditor && (
        <NodeEditor
          node={editorNode}
          parentId={editorParentId}
          onSave={handleEditorSave}
          onClose={() => setShowEditor(false)}
        />
      )}

      {showEdgeModal && (
        <EdgeModal
          nodes={allNodes}
          onSave={() => { setShowEdgeModal(false); handleRefresh(); }}
          onClose={() => setShowEdgeModal(false)}
        />
      )}
    </div>
  );
}
