import { dijkstra, type DijkstraResult } from "@/algorithms/dijkstra";
import { analyzeTraffic, type TrafficAnalysisResult } from "@/algorithms/trafficAnalysis";
import type { MSTResult } from "@/algorithms/mst";
import type { GraphEdge, TrafficGraph } from "@/types/trafficGraph";

export type CommuterRecommendation = {
  shortestRoute: DijkstraResult;
  fastestRoute: DijkstraResult;
  areRoutesIdentical: boolean;
  hasHeavyTrafficOnRoute: boolean;
  hasModerateTrafficOnRoute: boolean;
  recommendationMessage: string;
  trafficWarningMessage: string;
  commuterAlert: string;
  comparisonNote: string;
};

export type PriorityRoadScore = {
  road: GraphEdge;
  priorityScore: number;
};

export type AdminDecisionSupport = {
  trafficAnalysis: TrafficAnalysisResult;
  topCongestedRoad: GraphEdge | null;
  priorityRoads: PriorityRoadScore[];
  networkConditionStatement: string;
  congestionActionMessage: string;
  mstSummaryMessage: string | null;
};

export type DecisionSummaryData = {
  commuterText: string;
  trafficText: string;
  infrastructureText: string;
  priorityText: string;
};

export function analyzeCommuterDecision(
  graph: TrafficGraph,
  sourceId: string | null,
  destinationId: string | null
): CommuterRecommendation | null {
  if (!sourceId || !destinationId) return null;

  const shortestRoute = dijkstra(graph, sourceId, destinationId, "distance");
  const fastestRoute = dijkstra(graph, sourceId, destinationId, "traffic");

  if (!shortestRoute.reachable || !fastestRoute.reachable) return null;

  const areRoutesIdentical = shortestRoute.path.join("->") === fastestRoute.path.join("->");

  // Check edges in the fastest route for traffic conditions
  const routeEdges: GraphEdge[] = [];
  for (let i = 0; i < fastestRoute.path.length - 1; i++) {
    const u = fastestRoute.path[i];
    const v = fastestRoute.path[i + 1];
    const edge = graph.edges.find(
      (e) => (e.source === u && e.target === v) || (e.source === v && e.target === u)
    );
    if (edge) routeEdges.push(edge);
  }

  const hasHeavyTrafficOnRoute = routeEdges.some((e) => e.condition === "heavy");
  const hasModerateTrafficOnRoute = routeEdges.some((e) => e.condition === "moderate");

  let recommendationMessage = "";
  if (areRoutesIdentical) {
    recommendationMessage =
      "Recommended route: Use the selected route. Current traffic conditions do not make an alternative path more efficient.";
  } else {
    recommendationMessage =
      "Recommended route: Use the traffic-aware fastest route because current congestion makes the shortest-distance route less efficient.";
  }

  let trafficWarningMessage = "";
  if (hasHeavyTrafficOnRoute) {
    trafficWarningMessage = "Traffic warning: This route includes heavily congested roads.";
  } else {
    trafficWarningMessage = "Traffic status: No heavy-congestion road is present on the recommended route.";
  }

  let commuterAlert = "";
  if (hasHeavyTrafficOnRoute) {
    commuterAlert = "High congestion detected on part of the network.";
  } else if (hasModerateTrafficOnRoute) {
    commuterAlert = "Moderate congestion may affect route efficiency.";
  } else {
    commuterAlert = "No heavily congested roads are currently affecting the selected route.";
  }

  let comparisonNote = "";
  if (areRoutesIdentical) {
    comparisonNote = "Both objectives currently select the same route.";
  } else {
    comparisonNote = "Traffic weighting changes the recommended route.";
  }

  return {
    shortestRoute,
    fastestRoute,
    areRoutesIdentical,
    hasHeavyTrafficOnRoute,
    hasModerateTrafficOnRoute,
    recommendationMessage,
    trafficWarningMessage,
    commuterAlert,
    comparisonNote,
  };
}

export function analyzeAdminDecision(
  graph: TrafficGraph,
  mstResult: MSTResult | null
): AdminDecisionSupport {
  const trafficAnalysis = analyzeTraffic(graph);

  // Compute Priority Scores: priorityScore = trafficMultiplier * distance
  const priorityRoads: PriorityRoadScore[] = graph.edges
    .map((edge) => ({
      road: edge,
      priorityScore: edge.trafficMultiplier * edge.distance,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  const topCongestedRoad = trafficAnalysis.mostCongestedRoads[0] ?? null;

  const networkConditionStatement = `${trafficAnalysis.congestionPercentage.toFixed(
    0
  )}% of the network is currently operating under moderate or heavy traffic.`;

  let congestionActionMessage = "Priority action: Monitoring network conditions.";
  if (topCongestedRoad) {
    congestionActionMessage = `Priority action: Review ${topCongestedRoad.id} (${topCongestedRoad.source}—${topCongestedRoad.target}) for traffic management intervention.`;
  }

  let mstSummaryMessage: string | null = null;
  if (mstResult) {
    mstSummaryMessage = `The minimum spanning tree using ${mstResult.algorithm}'s algorithm connects all ${mstResult.nodesConnected} intersections using ${mstResult.totalDistance.toFixed(
      1
    )} km of total infrastructure distance (${mstResult.edgesSelected} roads).`;
  }

  return {
    trafficAnalysis,
    topCongestedRoad,
    priorityRoads,
    networkConditionStatement,
    congestionActionMessage,
    mstSummaryMessage,
  };
}

export function generateDecisionSummary(
  graph: TrafficGraph,
  sourceId: string | null,
  destinationId: string | null,
  commuterRec: CommuterRecommendation | null,
  adminSupport: AdminDecisionSupport,
  mstResult: MSTResult | null
): DecisionSummaryData {
  let commuterText = "Select a source and destination to view recommended route.";
  if (sourceId && destinationId && commuterRec) {
    commuterText = `Recommended route: ${commuterRec.fastestRoute.path.join(" → ")}`;
  }

  const heavyCount = adminSupport.trafficAnalysis.conditionCounts.heavy;
  const trafficText = `${heavyCount} road${heavyCount === 1 ? "" : "s"} ${
    heavyCount === 1 ? "is" : "are"
  } heavily congested.`;

  const requiredEdges = Math.max(graph.nodes.length - 1, 0);
  let infrastructureText = "Run Prim or Kruskal to generate infrastructure recommendations.";
  if (mstResult) {
    infrastructureText = `MST requires ${mstResult.edgesSelected} roads to connect all ${graph.nodes.length} intersections (${mstResult.totalDistance.toFixed(1)} km).`;
  } else {
    infrastructureText = `MST requires ${requiredEdges} roads to connect all ${graph.nodes.length} intersections.`;
  }

  let priorityText = "No priority roads calculated.";
  const topPriority = adminSupport.priorityRoads[0];
  if (topPriority) {
    priorityText = `Highest current intervention priority: ${topPriority.road.id} (${topPriority.road.source}—${topPriority.road.target}, Score: ${topPriority.priorityScore.toFixed(2)})`;
  }

  return {
    commuterText,
    trafficText,
    infrastructureText,
    priorityText,
  };
}
