import type { GraphEdge, TrafficCondition, TrafficGraph } from "@/types/trafficGraph";

export type TrafficAnalysisResult = {
  totalRoads: number;
  conditionCounts: Record<TrafficCondition, number>;
  conditionPercentages: Record<TrafficCondition, number>;
  averageRoadDistance: number;
  totalNetworkDistance: number;
  averageTrafficMultiplier: number;
  congestionPercentage: number;
  mostCongestedRoads: GraphEdge[];
};

const trafficSeverity: Record<TrafficCondition, number> = {
  normal: 0,
  moderate: 1,
  heavy: 2,
};

export function analyzeTraffic(graph: TrafficGraph): TrafficAnalysisResult {
  const conditionCounts: Record<TrafficCondition, number> = { normal: 0, moderate: 0, heavy: 0 };
  let totalNetworkDistance = 0;
  let totalTrafficMultiplier = 0;

  for (const edge of graph.edges) {
    conditionCounts[edge.condition] += 1;
    totalNetworkDistance += edge.distance;
    totalTrafficMultiplier += edge.trafficMultiplier;
  }

  const totalRoads = graph.edges.length;
  const asPercentage = (count: number) => totalRoads === 0 ? 0 : (count / totalRoads) * 100;
  const mostCongestedRoads = [...graph.edges]
    .sort((first, second) => trafficSeverity[second.condition] - trafficSeverity[first.condition] || second.trafficMultiplier - first.trafficMultiplier || first.id.localeCompare(second.id))
    .slice(0, 5);

  return {
    totalRoads,
    conditionCounts,
    conditionPercentages: {
      normal: asPercentage(conditionCounts.normal),
      moderate: asPercentage(conditionCounts.moderate),
      heavy: asPercentage(conditionCounts.heavy),
    },
    averageRoadDistance: totalRoads === 0 ? 0 : totalNetworkDistance / totalRoads,
    totalNetworkDistance,
    averageTrafficMultiplier: totalRoads === 0 ? 0 : totalTrafficMultiplier / totalRoads,
    congestionPercentage: asPercentage(conditionCounts.moderate + conditionCounts.heavy),
    mostCongestedRoads,
  };
}