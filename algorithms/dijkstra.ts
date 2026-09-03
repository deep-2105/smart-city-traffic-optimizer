import type { TrafficGraph } from "@/types/trafficGraph";

export type DijkstraResult = {
  path: string[];
  totalDistance: number | null;
  totalCost: number | null;
  visitedNodeIds: string[];
  visitedCount: number;
  reachable: boolean;
};

export type DijkstraCostMode = "distance" | "traffic";

type QueueEntry = {
  nodeId: string;
  distance: number;
};

class MinHeap {
  private readonly entries: QueueEntry[] = [];

  get size(): number {
    return this.entries.length;
  }

  push(entry: QueueEntry): void {
    this.entries.push(entry);
    let index = this.entries.length - 1;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.entries[parentIndex].distance <= this.entries[index].distance) break;
      [this.entries[parentIndex], this.entries[index]] = [this.entries[index], this.entries[parentIndex]];
      index = parentIndex;
    }
  }

  pop(): QueueEntry | undefined {
    const minimum = this.entries[0];
    const last = this.entries.pop();

    if (!minimum || !last || this.entries.length === 0) return minimum;

    this.entries[0] = last;
    let index = 0;

    while (true) {
      const leftIndex = index * 2 + 1;
      const rightIndex = index * 2 + 2;
      let smallestIndex = index;

      if (leftIndex < this.entries.length && this.entries[leftIndex].distance < this.entries[smallestIndex].distance) {
        smallestIndex = leftIndex;
      }
      if (rightIndex < this.entries.length && this.entries[rightIndex].distance < this.entries[smallestIndex].distance) {
        smallestIndex = rightIndex;
      }
      if (smallestIndex === index) break;

      [this.entries[index], this.entries[smallestIndex]] = [this.entries[smallestIndex], this.entries[index]];
      index = smallestIndex;
    }

    return minimum;
  }
}

export function dijkstra(graph: TrafficGraph, startNodeId: string, destinationNodeId: string, costMode: DijkstraCostMode = "distance"): DijkstraResult {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  if (!nodeIds.has(startNodeId)) throw new Error(`Unknown Dijkstra start node: ${startNodeId}`);
  if (!nodeIds.has(destinationNodeId)) throw new Error(`Unknown Dijkstra destination node: ${destinationNodeId}`);

  const distances = new Map<string, number>(graph.nodes.map((node) => [node.id, Number.POSITIVE_INFINITY]));
  const previous = new Map<string, string>();
  const finalized = new Set<string>();
  const visitedNodeIds: string[] = [];
  const queue = new MinHeap();

  distances.set(startNodeId, 0);
  queue.push({ nodeId: startNodeId, distance: 0 });

  while (queue.size > 0) {
    const current = queue.pop();
    if (!current || finalized.has(current.nodeId)) continue;

    finalized.add(current.nodeId);
    visitedNodeIds.push(current.nodeId);
    if (current.nodeId === destinationNodeId) break;

    for (const edge of graph.edges) {
      const neighborId = edge.source === current.nodeId ? edge.target : edge.target === current.nodeId ? edge.source : null;
      if (!neighborId || finalized.has(neighborId)) continue;

      const edgeCost = costMode === "traffic" ? edge.distance * edge.trafficMultiplier : edge.distance;
      const candidateDistance = current.distance + edgeCost;
      if (candidateDistance >= (distances.get(neighborId) ?? Number.POSITIVE_INFINITY)) continue;

      distances.set(neighborId, candidateDistance);
      previous.set(neighborId, current.nodeId);
      queue.push({ nodeId: neighborId, distance: candidateDistance });
    }
  }

  const totalCost = distances.get(destinationNodeId) ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(totalCost)) {
    return { path: [], totalDistance: null, totalCost: null, visitedNodeIds, visitedCount: visitedNodeIds.length, reachable: false };
  }

  const path: string[] = [];
  for (let nodeId: string | undefined = destinationNodeId; nodeId !== undefined; nodeId = previous.get(nodeId)) {
    path.unshift(nodeId);
  }

  const totalDistance = path.slice(1).reduce((distance, nodeId, index) => {
    const previousNodeId = path[index];
    const edge = graph.edges.find((item) => (item.source === previousNodeId && item.target === nodeId) || (item.target === previousNodeId && item.source === nodeId));
    return distance + (edge?.distance ?? 0);
  }, 0);

  return { path, totalDistance, totalCost, visitedNodeIds, visitedCount: visitedNodeIds.length, reachable: true };
}