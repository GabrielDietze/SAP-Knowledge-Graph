import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { getNodeConfig } from './nodeConfig';
import { updateNode, createEdge } from '../api';

const nodeTypes = { custom: CustomNode };

function buildFlowNodes(apiNodes) {
  return apiNodes.map((n, i) => ({
    id: n.id,
    type: 'custom',
    position: { x: n.pos_x || (i % 4) * 260 + 60, y: n.pos_y || Math.floor(i / 4) * 200 + 60 },
    data: {
      title: n.title,
      type: n.type,
      description: n.description,
      tags: n.tags,
      hasChildren: n.hasChildren,
    },
    draggable: true,
  }));
}

function buildFlowEdges(apiEdges) {
  return apiEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label || '',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
    style: { stroke: '#475569', strokeWidth: 1.5 },
    labelStyle: { fill: '#64748b', fontSize: 10 },
    labelBgStyle: { fill: '#0f172a' },
  }));
}

export default function GraphCanvas({ graphData, onNodeClick, onRefresh, selectedNodeId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!graphData) return;
    setNodes(buildFlowNodes(graphData.nodes));
    setEdges(buildFlowEdges(graphData.edges));
  }, [graphData]);

  // Highlight selected node
  useEffect(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      selected: n.id === selectedNodeId,
    })));
  }, [selectedNodeId]);

  const onNodeDragStop = useCallback((_, node) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateNode(node.id, { pos_x: node.position.x, pos_y: node.position.y });
    }, 500);
  }, []);

  const onConnect = useCallback(async (params) => {
    const edge = await createEdge({ source: params.source, target: params.target, label: '' });
    setEdges(eds => addEdge({
      ...params,
      id: edge.id,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
      style: { stroke: '#475569', strokeWidth: 1.5 },
    }, eds));
  }, []);

  const handleNodeClick = useCallback((_, node) => {
    const apiNode = graphData?.nodes.find(n => n.id === node.id);
    if (apiNode) onNodeClick(apiNode);
  }, [graphData, onNodeClick]);

  const minimapNodeColor = useCallback((n) => {
    const apiNode = graphData?.nodes.find(a => a.id === n.id);
    return apiNode ? getNodeConfig(apiNode.type).color : '#374151';
  }, [graphData]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onNodeDragStop={onNodeDragStop}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.2}
      maxZoom={2}
      deleteKeyCode={null}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e293b" />
      <Controls />
      <MiniMap
        nodeColor={minimapNodeColor}
        maskColor="rgba(0,0,0,0.6)"
        style={{ background: '#0a1628' }}
      />
    </ReactFlow>
  );
}
