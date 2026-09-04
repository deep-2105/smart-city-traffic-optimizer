"use client";

import { useState } from "react";
import { trafficGraph } from "@/data/trafficGraph";
import type { GraphEdge, GraphNode } from "@/types/trafficGraph";

type CityTrafficNetworkProps = {
  source: GraphNode | null;
  destination: GraphNode | null;
  onSelectionChange: (source: GraphNode | null, destination: GraphNode | null) => void;
  onResetSelection: () => void;
  visitedNodeIds: Set<string>;
  currentNodeId: string | null;
  routeNodeIds: readonly string[];
  mstEdgeIds: readonly string[];
  focusedRoadId: string | null;
};

const conditionLabels = { normal: "Normal", moderate: "Moderate", heavy: "Heavy" } as const;

function getNode(id: string): GraphNode {
  const node = trafficGraph.nodes.find((item) => item.id === id);
  if (!node) throw new Error(`Unknown graph node: ${id}`);
  return node;
}

function getConnectedEdges(nodeId: string): GraphEdge[] {
  return trafficGraph.edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
}

export default function CityTrafficNetwork({ source, destination, onSelectionChange, onResetSelection, visitedNodeIds, currentNodeId, routeNodeIds, mstEdgeIds, focusedRoadId }: CityTrafficNetworkProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const selectNode = (node: GraphNode) => {
    setSelectedNode(node);
    if (!source) {
      onSelectionChange(node, null);
    } else if (!destination) {
      onSelectionChange(source, node);
    }
  };

  const resetSelection = () => {
    setSelectedNode(null);
    onResetSelection();
  };

  const connectedEdges = selectedNode ? getConnectedEdges(selectedNode.id) : [];
  const counts = trafficGraph.edges.reduce((summary, edge) => ({ ...summary, [edge.condition]: summary[edge.condition] + 1 }), { normal: 0, moderate: 0, heavy: 0 });
  const getNodeName = (id: string) => getNode(id).name;

  return <div className="network-module">
    <div className="network-canvas interactive-network">
      <div className="map-grid" />
      <svg className="road-lines" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Interactive city road network">
        {trafficGraph.edges.map((edge) => {
          const sourceNode = getNode(edge.source);
          const targetNode = getNode(edge.target);
          const isConnected = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
          const isRouteEdge = routeNodeIds.some((nodeId, index) => index > 0 && ((routeNodeIds[index - 1] === edge.source && nodeId === edge.target) || (routeNodeIds[index - 1] === edge.target && nodeId === edge.source)));
          const isMstEdge = mstEdgeIds.includes(edge.id);
          return <g className={`road road-${edge.condition} ${mstEdgeIds.length > 0 ? "road-mst-context" : ""} ${isConnected ? "road-selected" : ""} ${isMstEdge ? "road-mst" : ""} ${isRouteEdge ? "road-route" : ""} ${focusedRoadId === edge.id ? "road-analysis-focus" : ""}`} key={edge.id}>
            <line x1={sourceNode.x} y1={sourceNode.y} x2={targetNode.x} y2={targetNode.y} />
            <text x={(sourceNode.x + targetNode.x) / 2} y={(sourceNode.y + targetNode.y) / 2 - 1.5}>{edge.distance} km</text>
          </g>;
        })}
    </svg>
    <div className="network-node-layer">
      {trafficGraph.nodes.map((node) => <button type="button" className={`network-node ${selectedNode?.id === node.id ? "node-selected" : ""} ${source?.id === node.id ? "node-source" : ""} ${destination?.id === node.id ? "node-destination" : ""} ${routeNodeIds.includes(node.id) ? "node-route" : ""} ${visitedNodeIds.has(node.id) ? "node-visited" : ""} ${currentNodeId === node.id ? "node-current" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => selectNode(node)} key={node.id} aria-label={`Select ${node.id}, ${node.name}`}><span>{node.id}</span></button>)}
      </div>
      <div className="map-label label-north">North District</div><div className="map-label label-central">Central Hub</div><div className="map-label label-south">South Network</div>
      <div className="map-legend"><span className="legend-key normal" /> Normal <span className="legend-key moderate" /> Moderate <span className="legend-key heavy" /> Heavy</div>
    </div>
    <div className="network-controls"><span>{source ? `Source: ${source.id}` : "Select a source"}</span><span>{destination ? `Destination: ${destination.id}` : "Then select a destination"}</span><button type="button" className="reset-button" onClick={resetSelection}>Reset selection</button></div>
    <div className="network-details">
      <div className="network-summary"><div><span>Total intersections</span><strong>{trafficGraph.nodes.length}</strong></div><div><span>Total roads</span><strong>{trafficGraph.edges.length}</strong></div><div><span>Normal</span><strong className="text-normal">{counts.normal}</strong></div><div><span>Moderate</span><strong className="text-moderate">{counts.moderate}</strong></div><div><span>Heavy</span><strong className="text-heavy">{counts.heavy}</strong></div></div>
      <div className="selected-road-info">{selectedNode ? <><div className="selected-node-heading"><span className="selected-node-id">{selectedNode.id}</span><div><strong>{selectedNode.name}</strong><small>{connectedEdges.length} connected roads</small></div></div><div className="connected-roads">{connectedEdges.map((edge) => <div className="connected-road" key={edge.id}><span className={`condition-dot ${edge.condition}`} /><span>{getNodeName(edge.source === selectedNode.id ? edge.target : edge.source)}</span><small>{edge.distance} km · {conditionLabels[edge.condition]}</small></div>)}</div></> : <p className="network-empty">Click an intersection to inspect connected roads and set route endpoints.</p>}</div>
    </div>
  </div>;
}
