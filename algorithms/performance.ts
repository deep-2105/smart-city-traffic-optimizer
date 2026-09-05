import { dijkstra } from "@/algorithms/dijkstra";
import { kruskalMST, primMST } from "@/algorithms/mst";
import { bfs, dfs } from "@/algorithms/traversal";
import type { TrafficGraph } from "@/types/trafficGraph";

export type AlgorithmMetric = {
  id: string;
  name: string;
  category: "Traversal" | "Shortest Path" | "Minimum Spanning Tree";
  timeComplexity: string;
  spaceComplexity: string;
  nodesProcessed: number;
  edgesProcessed: number;
  executionTimeMs: number | null;
  status: "Ready" | "Completed" | "Error";
  systemModule: string;
  purpose: string;
};

export type PerformanceBenchmarkResult = {
  vertexCount: number;
  edgeCount: number;
  testRoute: string;
  metrics: AlgorithmMetric[];
  allZeroOrNegligible: boolean;
  slowestTimeMs: number;
};

export const ALGORITHM_DEFINITIONS: Omit<AlgorithmMetric, "executionTimeMs" | "status" | "nodesProcessed" | "edgesProcessed">[] = [
  {
    id: "bfs",
    name: "BFS",
    category: "Traversal",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    systemModule: "Graph Traversal",
    purpose: "Unweighted network traversal",
  },
  {
    id: "dfs",
    name: "DFS",
    category: "Traversal",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    systemModule: "Graph Traversal",
    purpose: "Deep exploration of the network",
  },
  {
    id: "dijkstra",
    name: "Dijkstra",
    category: "Shortest Path",
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V)",
    systemModule: "Route Optimization",
    purpose: "Weighted shortest-path routing",
  },
  {
    id: "prim",
    name: "Prim",
    category: "Minimum Spanning Tree",
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V + E)",
    systemModule: "Infrastructure Planning",
    purpose: "Minimum infrastructure network from starting node",
  },
  {
    id: "kruskal",
    name: "Kruskal",
    category: "Minimum Spanning Tree",
    timeComplexity: "O(E log E)",
    spaceComplexity: "O(V + E)",
    systemModule: "Infrastructure Planning",
    purpose: "Minimum infrastructure network using sorted edges",
  },
];

export function runPerformanceBenchmark(graph: TrafficGraph, startNodeId = "A1", destinationNodeId = "C3"): PerformanceBenchmarkResult {
  const metrics: AlgorithmMetric[] = [];
  let slowestTimeMs = 0;

  // 1. BFS
  const bfsStart = performance.now();
  const bfsRes = bfs(graph, startNodeId);
  const bfsEnd = performance.now();
  const bfsTime = bfsEnd - bfsStart;
  if (bfsTime > slowestTimeMs) slowestTimeMs = bfsTime;
  metrics.push({
    ...ALGORITHM_DEFINITIONS[0],
    executionTimeMs: bfsTime,
    nodesProcessed: bfsRes.visitedCount,
    edgesProcessed: graph.edges.length,
    status: "Completed",
  });

  // 2. DFS
  const dfsStart = performance.now();
  const dfsRes = dfs(graph, startNodeId);
  const dfsEnd = performance.now();
  const dfsTime = dfsEnd - dfsStart;
  if (dfsTime > slowestTimeMs) slowestTimeMs = dfsTime;
  metrics.push({
    ...ALGORITHM_DEFINITIONS[1],
    executionTimeMs: dfsTime,
    nodesProcessed: dfsRes.visitedCount,
    edgesProcessed: graph.edges.length,
    status: "Completed",
  });

  // 3. Dijkstra
  const dijkstraStart = performance.now();
  const dijkstraRes = dijkstra(graph, startNodeId, destinationNodeId, "distance");
  const dijkstraEnd = performance.now();
  const dijkstraTime = dijkstraEnd - dijkstraStart;
  if (dijkstraTime > slowestTimeMs) slowestTimeMs = dijkstraTime;
  metrics.push({
    ...ALGORITHM_DEFINITIONS[2],
    executionTimeMs: dijkstraTime,
    nodesProcessed: dijkstraRes.visitedCount,
    edgesProcessed: graph.edges.length,
    status: "Completed",
  });

  // 4. Prim
  const primStart = performance.now();
  const primRes = primMST(graph);
  const primEnd = performance.now();
  const primTime = primEnd - primStart;
  if (primTime > slowestTimeMs) slowestTimeMs = primTime;
  metrics.push({
    ...ALGORITHM_DEFINITIONS[3],
    executionTimeMs: primTime,
    nodesProcessed: primRes.nodesConnected,
    edgesProcessed: primRes.edgesSelected,
    status: "Completed",
  });

  // 5. Kruskal
  const kruskalStart = performance.now();
  const kruskalRes = kruskalMST(graph);
  const kruskalEnd = performance.now();
  const kruskalTime = kruskalEnd - kruskalStart;
  if (kruskalTime > slowestTimeMs) slowestTimeMs = kruskalTime;
  metrics.push({
    ...ALGORITHM_DEFINITIONS[4],
    executionTimeMs: kruskalTime,
    nodesProcessed: kruskalRes.nodesConnected,
    edgesProcessed: kruskalRes.edgesSelected,
    status: "Completed",
  });

  const allZeroOrNegligible = metrics.every((m) => m.executionTimeMs !== null && m.executionTimeMs < 0.05);

  return {
    vertexCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    testRoute: `${startNodeId} → ${destinationNodeId}`,
    metrics,
    allZeroOrNegligible,
    slowestTimeMs,
  };
}
