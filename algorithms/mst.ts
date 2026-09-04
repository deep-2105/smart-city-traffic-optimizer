import type { GraphEdge, TrafficGraph } from "@/types/trafficGraph";

export type MSTAlgorithm = "Prim" | "Kruskal";

export type MSTResult = {
  algorithm: MSTAlgorithm;
  selectedEdgeIds: string[];
  selectedEdges: GraphEdge[];
  totalDistance: number;
  nodesConnected: number;
  edgesSelected: number;
  isConnected: boolean;
};

class EdgeMinHeap {
  private readonly edges: GraphEdge[] = [];

  get size(): number {
    return this.edges.length;
  }

  push(edge: GraphEdge): void {
    this.edges.push(edge);
    let index = this.edges.length - 1;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.edges[parentIndex].distance <= this.edges[index].distance) break;
      [this.edges[parentIndex], this.edges[index]] = [this.edges[index], this.edges[parentIndex]];
      index = parentIndex;
    }
  }

  pop(): GraphEdge | undefined {
    const minimum = this.edges[0];
    const last = this.edges.pop();
    if (!minimum || !last || this.edges.length === 0) return minimum;

    this.edges[0] = last;
    let index = 0;
    while (true) {
      const leftIndex = index * 2 + 1;
      const rightIndex = index * 2 + 2;
      let smallestIndex = index;

      if (leftIndex < this.edges.length && this.edges[leftIndex].distance < this.edges[smallestIndex].distance) smallestIndex = leftIndex;
      if (rightIndex < this.edges.length && this.edges[rightIndex].distance < this.edges[smallestIndex].distance) smallestIndex = rightIndex;
      if (smallestIndex === index) break;

      [this.edges[index], this.edges[smallestIndex]] = [this.edges[smallestIndex], this.edges[index]];
      index = smallestIndex;
    }

    return minimum;
  }
}

class DisjointSet {
  private readonly parent = new Map<string, string>();
  private readonly rank = new Map<string, number>();

  constructor(nodeIds: readonly string[]) {
    for (const nodeId of nodeIds) {
      this.parent.set(nodeId, nodeId);
      this.rank.set(nodeId, 0);
    }
  }

  find(nodeId: string): string {
    const parent = this.parent.get(nodeId);
    if (parent === undefined) throw new Error(`Unknown graph node: ${nodeId}`);
    if (parent === nodeId) return nodeId;

    const root = this.find(parent);
    this.parent.set(nodeId, root);
    return root;
  }

  union(firstNodeId: string, secondNodeId: string): boolean {
    const firstRoot = this.find(firstNodeId);
    const secondRoot = this.find(secondNodeId);
    if (firstRoot === secondRoot) return false;

    const firstRank = this.rank.get(firstRoot) ?? 0;
    const secondRank = this.rank.get(secondRoot) ?? 0;
    if (firstRank < secondRank) {
      this.parent.set(firstRoot, secondRoot);
    } else if (firstRank > secondRank) {
      this.parent.set(secondRoot, firstRoot);
    } else {
      this.parent.set(secondRoot, firstRoot);
      this.rank.set(firstRoot, firstRank + 1);
    }
    return true;
  }
}

function createResult(algorithm: MSTAlgorithm, nodes: readonly string[], selectedEdges: GraphEdge[]): MSTResult {
  const connectedNodeIds = new Set(selectedEdges.flatMap((edge) => [edge.source, edge.target]));
  if (nodes.length === 1) connectedNodeIds.add(nodes[0]);

  return {
    algorithm,
    selectedEdgeIds: selectedEdges.map((edge) => edge.id),
    selectedEdges,
    totalDistance: selectedEdges.reduce((total, edge) => total + edge.distance, 0),
    nodesConnected: connectedNodeIds.size,
    edgesSelected: selectedEdges.length,
    isConnected: nodes.length > 0 && connectedNodeIds.size === nodes.length && selectedEdges.length === nodes.length - 1,
  };
}

export function primMST(graph: TrafficGraph): MSTResult {
  const startNode = graph.nodes[0];
  if (!startNode) return createResult("Prim", [], []);

  const connectedNodeIds = new Set<string>([startNode.id]);
  const selectedEdges: GraphEdge[] = [];
  const candidateEdges = new EdgeMinHeap();
  const addIncidentEdges = (nodeId: string) => {
    for (const edge of graph.edges) {
      if (edge.source === nodeId || edge.target === nodeId) candidateEdges.push(edge);
    }
  };

  addIncidentEdges(startNode.id);
  while (candidateEdges.size > 0 && connectedNodeIds.size < graph.nodes.length) {
    const edge = candidateEdges.pop();
    if (!edge) continue;
    const sourceConnected = connectedNodeIds.has(edge.source);
    const targetConnected = connectedNodeIds.has(edge.target);
    if (sourceConnected === targetConnected) continue;

    const nextNodeId = sourceConnected ? edge.target : edge.source;
    selectedEdges.push(edge);
    connectedNodeIds.add(nextNodeId);
    addIncidentEdges(nextNodeId);
  }

  return createResult("Prim", graph.nodes.map((node) => node.id), selectedEdges);
}

export function kruskalMST(graph: TrafficGraph): MSTResult {
  const nodeIds = graph.nodes.map((node) => node.id);
  const disjointSet = new DisjointSet(nodeIds);
  const selectedEdges: GraphEdge[] = [];

  for (const edge of [...graph.edges].sort((first, second) => first.distance - second.distance)) {
    if (!disjointSet.union(edge.source, edge.target)) continue;
    selectedEdges.push(edge);
    if (selectedEdges.length === nodeIds.length - 1) break;
  }

  return createResult("Kruskal", nodeIds, selectedEdges);
}