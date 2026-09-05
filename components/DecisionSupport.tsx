"use client";

import {
  analyzeAdminDecision,
  analyzeCommuterDecision,
  generateDecisionSummary,
} from "@/algorithms/decisionSupport";
import type { MSTResult } from "@/algorithms/mst";
import type { GraphNode, TrafficCondition, TrafficGraph } from "@/types/trafficGraph";

type DecisionSupportProps = {
  graph: TrafficGraph;
  source: GraphNode | null;
  destination: GraphNode | null;
  mstResult: MSTResult | null;
};

const conditionLabels: Record<TrafficCondition, string> = {
  normal: "Normal",
  moderate: "Moderate",
  heavy: "Heavy",
};

export default function DecisionSupport({
  graph,
  source,
  destination,
  mstResult,
}: DecisionSupportProps) {
  const commuterRec = analyzeCommuterDecision(
    graph,
    source ? source.id : null,
    destination ? destination.id : null
  );

  const adminSupport = analyzeAdminDecision(graph, mstResult);

  const summary = generateDecisionSummary(
    graph,
    source ? source.id : null,
    destination ? destination.id : null,
    commuterRec,
    adminSupport,
    mstResult
  );

  return (
    <section id="decision-support" className="decision-support-panel panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">DECISION ENGINE</p>
          <h2>Decision Support &amp; Smart Recommendations</h2>
        </div>
        <span className="decision-status">
          <i /> Rule-based Intelligence
        </span>
      </div>

      {/* Decision Summary Card */}
      <div className="decision-summary-card">
        <div className="decision-summary-header">
          <strong>Decision Summary</strong>
          <span>Integrated Insights</span>
        </div>
        <div className="decision-summary-grid">
          <div className="summary-item">
            <span className="summary-label">Commuter</span>
            <p className="summary-text">{summary.commuterText}</p>
          </div>
          <div className="summary-item">
            <span className="summary-label">Traffic Status</span>
            <p className="summary-text">{summary.trafficText}</p>
          </div>
          <div className="summary-item">
            <span className="summary-label">Infrastructure</span>
            <p className="summary-text">{summary.infrastructureText}</p>
          </div>
          <div className="summary-item">
            <span className="summary-label">Priority Action</span>
            <p className="summary-text">{summary.priorityText}</p>
          </div>
        </div>
      </div>

      <div className="decision-layout-grid">
        {/* 1. Commuter Decision Support */}
        <div className="decision-subpanel commuter-panel">
          <div className="subpanel-header">
            <h3>Commuter Decision Support</h3>
            <span className="subpanel-tag">Routing Advisor</span>
          </div>
          <p className="subpanel-subtitle">
            Route recommendations based on current network conditions
          </p>

          {!source || !destination || !commuterRec ? (
            <div className="decision-placeholder">
              <p>Select a source and destination to generate commuter recommendations.</p>
            </div>
          ) : (
            <div className="commuter-content">
              <div className="recommended-route-box">
                <div className="box-header">
                  <strong>Recommended Route</strong>
                  <span className="rec-tag">Fastest</span>
                </div>
                <div className="route-endpoints-info">
                  <div>
                    <span>Source</span>
                    <strong>{source.id} · {source.name}</strong>
                  </div>
                  <div>
                    <span>Destination</span>
                    <strong>{destination.id} · {destination.name}</strong>
                  </div>
                  <div>
                    <span>Distance</span>
                    <strong>{commuterRec.fastestRoute.totalDistance?.toFixed(1)} km</strong>
                  </div>
                  <div>
                    <span>Traffic Cost</span>
                    <strong>{commuterRec.fastestRoute.totalCost?.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="rec-path-line">
                  <span>Path:</span>
                  <strong>{commuterRec.fastestRoute.path.join(" → ")}</strong>
                </div>
              </div>

              <div className="recommendation-rules-box">
                <p className="rule-msg primary">{commuterRec.recommendationMessage}</p>
                <p className="rule-msg secondary">{commuterRec.trafficWarningMessage}</p>
              </div>

              <div className={`commuter-alert-banner ${commuterRec.hasHeavyTrafficOnRoute ? "alert-heavy" : commuterRec.hasModerateTrafficOnRoute ? "alert-moderate" : "alert-normal"}`}>
                <span className="alert-icon">!</span>
                <p>{commuterRec.commuterAlert}</p>
              </div>

              <div className="route-comparison-card">
                <h4>Objective Comparison</h4>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Shortest</th>
                      <th>Fastest</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Distance</td>
                      <td>{commuterRec.shortestRoute.totalDistance?.toFixed(1)} km</td>
                      <td>{commuterRec.fastestRoute.totalDistance?.toFixed(1)} km</td>
                    </tr>
                    <tr>
                      <td>Traffic Cost</td>
                      <td>{commuterRec.shortestRoute.totalCost?.toFixed(2)}</td>
                      <td>{commuterRec.fastestRoute.totalCost?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Recommendation</td>
                      <td>{commuterRec.areRoutesIdentical ? "Recommended" : "—"}</td>
                      <td>Recommended</td>
                    </tr>
                  </tbody>
                </table>
                <p className="comparison-note-text">{commuterRec.comparisonNote}</p>
              </div>
            </div>
          )}
        </div>

        {/* 2. City Administrator Decision Support */}
        <div className="decision-subpanel admin-panel">
          <div className="subpanel-header">
            <h3>City Administrator Decision Support</h3>
            <span className="subpanel-tag admin-tag">Network Operations</span>
          </div>
          <p className="subpanel-subtitle">
            Infrastructure and congestion priorities
          </p>

          <div className="admin-sections-list">
            {/* A. Congestion Priority */}
            <div className="admin-block">
              <h4>A. Congestion Priority</h4>
              <p className="admin-action-text">{adminSupport.congestionActionMessage}</p>
              {adminSupport.topCongestedRoad ? (
                <div className="top-road-badge">
                  <span>Highest Congestion Road:</span>
                  <strong>
                    {adminSupport.topCongestedRoad.id} ({adminSupport.topCongestedRoad.source} — {adminSupport.topCongestedRoad.target})
                  </strong>
                  <small>
                    {adminSupport.topCongestedRoad.distance} km · {conditionLabels[adminSupport.topCongestedRoad.condition]} ({adminSupport.topCongestedRoad.trafficMultiplier.toFixed(2)}×)
                  </small>
                </div>
              ) : null}
            </div>

            {/* B. Infrastructure Planning */}
            <div className="admin-block">
              <h4>B. Infrastructure Planning</h4>
              {mstResult ? (
                <div className="mst-decision-box">
                  <p className="mst-summary-msg">{adminSupport.mstSummaryMessage}</p>
                  <dl className="mst-mini-metrics">
                    <div>
                      <dt>Algorithm</dt>
                      <dd>{mstResult.algorithm}</dd>
                    </div>
                    <div>
                      <dt>Roads Selected</dt>
                      <dd>{mstResult.edgesSelected} / {Math.max(graph.nodes.length - 1, 0)}</dd>
                    </div>
                    <div>
                      <dt>Total Distance</dt>
                      <dd>{mstResult.totalDistance.toFixed(1)} km</dd>
                    </div>
                    <div>
                      <dt>Intersections</dt>
                      <dd>{mstResult.nodesConnected} / {graph.nodes.length}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className="no-mst-msg">
                  Run Prim or Kruskal to generate infrastructure recommendations.
                </p>
              )}
            </div>

            {/* C. Network Condition */}
            <div className="admin-block">
              <h4>C. Network Condition</h4>
              <p className="network-cond-msg">{adminSupport.networkConditionStatement}</p>
              <div className="admin-traffic-breakdown">
                <span>Total: <strong>{adminSupport.trafficAnalysis.totalRoads}</strong></span>
                <span className="text-normal">Normal: <strong>{adminSupport.trafficAnalysis.conditionCounts.normal}</strong></span>
                <span className="text-moderate">Moderate: <strong>{adminSupport.trafficAnalysis.conditionCounts.moderate}</strong></span>
                <span className="text-heavy">Heavy: <strong>{adminSupport.trafficAnalysis.conditionCounts.heavy}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Score Table */}
      <div className="priority-score-section">
        <div className="priority-header">
          <div>
            <h3>Congested Road Priority Scores</h3>
            <p className="priority-explanation">
              Priority Score = Traffic Multiplier × Physical Distance. This is a project-specific prioritization indicator for smart city resource allocation, not a real-world engineering standard.
            </p>
          </div>
          <span className="priority-tag">Top 3 Priorities</span>
        </div>

        <div className="priority-table-wrap">
          <table className="priority-table">
            <thead>
              <tr>
                <th>Priority Rank</th>
                <th>Road ID</th>
                <th>Endpoints</th>
                <th>Distance</th>
                <th>Condition</th>
                <th>Multiplier</th>
                <th>Priority Score</th>
              </tr>
            </thead>
            <tbody>
              {adminSupport.priorityRoads.map((item, idx) => (
                <tr key={item.road.id}>
                  <td className="rank-cell">#{idx + 1}</td>
                  <td className="road-id-cell"><strong>{item.road.id}</strong></td>
                  <td>{item.road.source} — {item.road.target}</td>
                  <td>{item.road.distance.toFixed(1)} km</td>
                  <td>
                    <span className={`condition-badge condition-${item.road.condition}`}>
                      {conditionLabels[item.road.condition]}
                    </span>
                  </td>
                  <td className="mono-cell">{item.road.trafficMultiplier.toFixed(2)}×</td>
                  <td className="score-cell"><strong>{item.priorityScore.toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology & Data Note */}
      <div className="decision-footer-notes">
        <p className="decision-methodology">
          <strong>Decision Methodology:</strong> Decision Support combines graph traversal, weighted shortest paths, traffic analysis, and minimum spanning trees to transform raw network data into commuter and infrastructure recommendations.
        </p>
        <p className="decision-disclaimer">
          <strong>Confidence &amp; Data Note:</strong> Recommendations are generated from the project&apos;s simulated traffic graph and algorithm results. They are decision-support indicators, not live traffic forecasts.
        </p>
      </div>
    </section>
  );
}
