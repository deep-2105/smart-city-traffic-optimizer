"use client";

import { analyzeTraffic } from "@/algorithms/trafficAnalysis";
import type { GraphEdge, TrafficCondition, TrafficGraph } from "@/types/trafficGraph";

type TrafficAnalysisProps = {
  graph: TrafficGraph;
  focusedRoadId: string | null;
  onRoadSelect: (road: GraphEdge) => void;
};

const conditionLabels: Record<TrafficCondition, string> = { normal: "Normal", moderate: "Moderate", heavy: "Heavy" };
const conditions: TrafficCondition[] = ["normal", "moderate", "heavy"];

export default function TrafficAnalysis({ graph, focusedRoadId, onRoadSelect }: TrafficAnalysisProps) {
  const analysis = analyzeTraffic(graph);

  return <article className="panel traffic-analysis-panel">
    <div className="panel-heading">
      <div><p className="panel-kicker">TRAFFIC ANALYSIS</p><h2>Traffic Analysis</h2></div>
      <span className="traffic-analysis-status">Current snapshot</span>
    </div>
    <p className="traffic-analysis-subtitle">Current network congestion overview</p>
    <div className="traffic-summary-metrics">
      <div><span>Total roads</span><strong>{analysis.totalRoads}</strong></div>
      <div><span>Normal</span><strong className="text-normal">{analysis.conditionCounts.normal}</strong></div>
      <div><span>Moderate</span><strong className="text-moderate">{analysis.conditionCounts.moderate}</strong></div>
      <div><span>Heavy</span><strong className="text-heavy">{analysis.conditionCounts.heavy}</strong></div>
      <div><span>Congestion</span><strong>{analysis.congestionPercentage.toFixed(0)}%</strong></div>
    </div>
    <div className="traffic-distribution" aria-label="Traffic distribution">
      {conditions.map((condition) => <div className="traffic-distribution-row" key={condition}>
        <span><i className={`condition-dot ${condition}`} />{conditionLabels[condition]}</span>
        <div><b className={condition} style={{ width: `${analysis.conditionPercentages[condition]}%` }} /></div>
        <strong>{analysis.conditionPercentages[condition].toFixed(0)}%</strong>
      </div>)}
    </div>
    <div className="congested-road-list">
      <div className="traffic-list-heading"><strong>Most Congested Roads</strong><span>Top 5</span></div>
      {analysis.mostCongestedRoads.map((road) => <button type="button" className={`congested-road ${focusedRoadId === road.id ? "road-focused" : ""}`} onClick={() => onRoadSelect(road)} key={road.id}>
        <span><strong>{road.id} · {road.source} — {road.target}</strong><small>{road.distance.toFixed(1)} km</small></span>
        <span><b className={`traffic-badge ${road.condition}`}>{conditionLabels[road.condition]}</b><small>{road.trafficMultiplier.toFixed(2)}×</small></span>
      </button>)}
    </div>
    <div className="network-insights">
      <strong>Network Insights</strong>
      <p>{analysis.conditionCounts.heavy} of {analysis.totalRoads} roads are currently heavily congested.</p>
      <p>{analysis.conditionPercentages.normal.toFixed(0)}% of roads are operating under normal traffic.</p>
      <p>Average traffic multiplier is {analysis.averageTrafficMultiplier.toFixed(2)}×.</p>
      <p>The network contains {analysis.totalNetworkDistance.toFixed(1)} km of roads.</p>
    </div>
    <p className="traffic-route-note">Traffic conditions are incorporated into Fastest route calculations using the road traffic multiplier.</p>
    <p className="traffic-complexity">Analysis: O(E) · Road ranking: O(E log E) · Space: O(E)</p>
  </article>;
}