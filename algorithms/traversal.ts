import type { GraphNode, TrafficGraph } from "@/types/trafficGraph";

export type TraversalResult = {
  order: string[];
  visited: Set<string>;
  visitedCount: number;
};

function getNeighbors(graph: TrafficGraph, nodeId: string): GraphNode[] {
  const neighborIds = graph.edges.flatMap((edge) => {
    if (edge.source === nodeId) return [edge.target];
    if (edge.target === nodeId) return [edge.source];
    return [];
  });

  return neighborIds
    .map((neighborId) => graph.nodes.find((node) => node.id === neighborId))
    .filter((node): node is GraphNode => node !== undefined);
}

function getStartNode(graph: TrafficGraph, startNodeId: string): GraphNode {
  const startNode = graph.nodes.find((node) => node.id === startNodeId);
  if (!startNode) throw new Error(`Unknown traversal start node: ${startNodeId}`);
  return startNode;
}

export function bfs(graph: TrafficGraph, startNodeId: string): TraversalResult {
  const startNode = getStartNode(graph, startNodeId);
  const queue: GraphNode[] = [startNode];
  const visited = new Set<string>([startNode.id]);
  const order: string[] = [];

  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (!currentNode) continue;
    order.push(currentNode.id);

    for (const neighbor of getNeighbors(graph, currentNode.id)) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    }
  }

  return { order, visited, visitedCount: order.length };
}

export function dfs(graph: TrafficGraph, startNodeId: string): TraversalResult {
  const startNode = getStartNode(graph, startNodeId);
  const stack: GraphNode[] = [startNode];
  const visited = new Set<string>();
  const order: string[] = [];

  while (stack.length > 0) {
    const currentNode = stack.pop();
    if (!currentNode || visited.has(currentNode.id)) continue;
    visited.add(currentNode.id);
    order.push(currentNode.id);

    const neighbors = getNeighbors(graph, currentNode.id);
    for (let index = neighbors.length - 1; index >= 0; index -= 1) {
      const neighbor = neighbors[index];
      if (!visited.has(neighbor.id)) stack.push(neighbor);
    }
  }

  return { order, visited, visitedCount: order.length };
}
