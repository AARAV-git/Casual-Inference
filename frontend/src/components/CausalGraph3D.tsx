'use client';

import { useCallback } from 'react';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'treatment' | 'outcome' | 'confounder';
}

interface Edge {
  from: string;
  to: string;
}

interface Props {
  mode: 'ambient' | 'interactive' | 'static';
  highlightedNodeId?: string | null;
  onNodeClick?: (nodeId: string) => void;
}

const NODES: Node[] = [
  { id: 'treatment', label: 'Treatment', x: 15, y: 50, type: 'treatment' },
  { id: 'outcome', label: 'Outcome', x: 85, y: 50, type: 'outcome' },
  { id: 'conf1', label: 'Tenure', x: 35, y: 15, type: 'confounder' },
  { id: 'conf2', label: 'Frequency', x: 50, y: 85, type: 'confounder' },
  { id: 'conf3', label: 'Diversity', x: 65, y: 15, type: 'confounder' },
  { id: 'conf4', label: 'Device', x: 30, y: 80, type: 'confounder' },
  { id: 'conf5', label: 'Time of Day', x: 75, y: 78, type: 'confounder' },
];

const EDGES: Edge[] = [
  { from: 'treatment', to: 'outcome' },
  { from: 'conf1', to: 'treatment' },
  { from: 'conf1', to: 'outcome' },
  { from: 'conf2', to: 'treatment' },
  { from: 'conf2', to: 'outcome' },
  { from: 'conf3', to: 'treatment' },
  { from: 'conf3', to: 'outcome' },
  { from: 'conf4', to: 'treatment' },
  { from: 'conf5', to: 'outcome' },
];

const TYPE_COLORS: Record<string, string> = {
  treatment: '#2DD4BF',
  outcome: '#F5A623',
  confounder: '#8B96A8',
};

export default function CausalGraph3D({ mode, highlightedNodeId, onNodeClick }: Props) {
  const getNodePos = useCallback((id: string) => {
    const n = NODES.find((node) => node.id === id);
    return n ? { x: n.x, y: n.y } : { x: 50, y: 50 };
  }, []);

  const height = mode === 'ambient' ? 180 : mode === 'static' ? 500 : 400;
  const showLabels = mode !== 'ambient';
  const showInteractivity = mode === 'interactive';

  return (
    <div
      className={`w-full rounded-lg border overflow-hidden bg-[#0A0E14] ${showInteractivity ? 'border-signal-teal/30' : 'border-grid-line'}`}
      style={{ height }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#1E2735" />
          </marker>
        </defs>

        {EDGES.map((edge, i) => {
          const from = getNodePos(edge.from);
          const to = getNodePos(edge.to);
          const isHighlighted = highlightedNodeId === edge.from || highlightedNodeId === edge.to;
          return (
            <line
              key={i}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isHighlighted ? '#2DD4BF' : '#1E2735'}
              strokeWidth={isHighlighted ? 0.6 : 0.4}
              opacity={isHighlighted ? 0.8 : 0.5}
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {NODES.map((node) => {
          const isHighlighted = highlightedNodeId === node.id;
          const color = isHighlighted ? '#2DD4BF' : TYPE_COLORS[node.type];
          const r = isHighlighted ? 5 : 3.5;
          const opacity = mode === 'ambient' ? 0.5 : 0.9;
          return (
            <g
              key={node.id}
              style={{ cursor: showInteractivity ? 'pointer' : 'default' }}
              onClick={() => onNodeClick?.(node.id)}
            >
              <circle
                cx={node.x} cy={node.y} r={r}
                fill={color}
                filter={isHighlighted ? 'url(#glow)' : undefined}
                opacity={opacity}
                stroke={isHighlighted ? '#2DD4BF' : 'transparent'}
                strokeWidth={1}
              />
              {showLabels && (
                <text
                  x={node.x} y={node.y - r - 2}
                  textAnchor="middle"
                  fill={isHighlighted ? '#2DD4BF' : '#E7ECF3'}
                  fontSize={isHighlighted ? '3.5' : '3'}
                  fontFamily="var(--font-space-grotesk), system-ui"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
