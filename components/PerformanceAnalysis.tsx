"use client";

import { useState } from "react";
import { ALGORITHM_DEFINITIONS, runPerformanceBenchmark, type PerformanceBenchmarkResult } from "@/algorithms/performance";
import type { TrafficGraph } from "@/types/trafficGraph";

type PerformanceAnalysisProps = {
  graph: TrafficGraph;
};

export default function PerformanceAnalysis({ graph }: PerformanceAnalysisProps) {
  const [benchmark, setBenchmark] = useState<PerformanceBenchmarkResult | null>(null);

  const handleRunBenchmark = () => {
    setBenchmark(runPerformanceBenchmark(graph));
  };

  const handleResetBenchmark = () => {
    setBenchmark(null);
  };

  const vertexCount = graph.nodes.length;
  const edgeCount = graph.edges.length;
  const testRoute = "A1 → C3";

  return (
    <section id="performance-analysis" className="performance-panel panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">CAPSTONE BENCHMARK</p>
          <h2>Performance Analysis</h2>
        </div>
        <span className={`performance-status ${benchmark ? "status-complete" : ""}`}>
          <i /> {benchmark ? "Benchmark complete" : "Ready to run"}
        </span>
      </div>

      <p className="performance-copy">
        Evaluate and compare computational complexity and execution time across all network graph algorithms.
      </p>

      <div className="performance-dataset-bar">
        <div>
          <span>Vertices (V)</span>
          <strong>{vertexCount}</strong>
        </div>
        <div>
          <span>Edges (E)</span>
          <strong>{edgeCount}</strong>
        </div>
        <div>
          <span>Test Route</span>
          <strong>{testRoute}</strong>
        </div>
        <div className="performance-actions">
          <button className="route-button" type="button" onClick={handleRunBenchmark}>
            Run Performance Test <span>→</span>
          </button>
          <button className="reset-button" type="button" onClick={handleResetBenchmark} disabled={!benchmark}>
            Reset Performance Test
          </button>
        </div>
      </div>

      <div className="performance-table-wrap">
        <table className="performance-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Category</th>
              <th>Time Complexity</th>
              <th>Space Complexity</th>
              <th>Execution Time</th>
              <th>System Module</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ALGORITHM_DEFINITIONS.map((def) => {
              const metric = benchmark?.metrics.find((m) => m.id === def.id);
              const timeDisplay = metric && metric.executionTimeMs !== null ? `${metric.executionTimeMs.toFixed(2)} ms` : "—";
              return (
                <tr key={def.id}>
                  <td className="alg-name-cell">
                    <strong>{def.name}</strong>
                    <small>{def.purpose}</small>
                  </td>
                  <td>
                    <span className={`category-tag category-${def.category.toLowerCase().replace(/\s+/g, "-")}`}>
                      {def.category}
                    </span>
                  </td>
                  <td className="mono-cell">{def.timeComplexity}</td>
                  <td className="mono-cell">{def.spaceComplexity}</td>
                  <td className="time-cell">{timeDisplay}</td>
                  <td>
                    <span className="module-tag">{def.systemModule}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${metric ? "status-done" : "status-pending"}`}>
                      {metric ? metric.status : "Ready"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="performance-comparison-section">
        <h3>Execution Time Comparison</h3>
        {benchmark ? (
          <div className="bar-comparison-container">
            {benchmark.allZeroOrNegligible ? (
              <p className="performance-note-callout">
                Execution times are below meaningful visual resolution for this small graph. All algorithms executed in sub-millisecond range.
              </p>
            ) : null}
            <div className="comparison-bars">
              {benchmark.metrics.map((metric) => {
                const time = metric.executionTimeMs ?? 0;
                const percentage = benchmark.slowestTimeMs > 0 ? Math.max((time / benchmark.slowestTimeMs) * 100, 6) : 0;
                return (
                  <div className="bar-row" key={metric.id}>
                    <span className="bar-label">{metric.name}</span>
                    <div className="bar-track">
                      <div className={`bar-fill bar-${metric.id}`} style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="bar-value">{time.toFixed(2)} ms</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="performance-empty-note">Click &quot;Run Performance Test&quot; to measure live algorithm execution times.</p>
        )}
      </div>

      <div className="performance-details-grid">
        <div className="performance-module-mapping">
          <h3>System Integration Mapping</h3>
          <ul>
            <li>
              <strong>BFS / DFS</strong>
              <span>→ Network Exploration (Unweighted traversal)</span>
            </li>
            <li>
              <strong>Dijkstra</strong>
              <span>→ Route Optimization (Weighted shortest-path &amp; traffic-aware)</span>
            </li>
            <li>
              <strong>Prim / Kruskal</strong>
              <span>→ Infrastructure Planning (Minimum Spanning Tree)</span>
            </li>
            <li>
              <strong>Traffic Analysis</strong>
              <span>→ Congestion Intelligence (Feeds traffic multipliers to Dijkstra)</span>
            </li>
          </ul>
        </div>

        <div className="performance-insights">
          <h3>Capstone Performance Insights</h3>
          <p>The current city network contains {vertexCount} intersections and {edgeCount} roads.</p>
          <p>Traversal algorithms (BFS/DFS) operate in O(V + E) time, visit level-by-level or deep paths without edge weight consideration.</p>
          <p>Dijkstra&apos;s algorithm achieves O((V + E) log V) with a binary min-priority queue, optimizing physical or traffic-weighted distance.</p>
          <p>Prim constructs minimum spanning trees incrementally in O((V + E) log V), while Kruskal sorts all edges in O(E log E) using Disjoint Set Union.</p>
          <p className="performance-disclaimer">Measured execution times are local browser high-resolution timestamps (`performance.now()`) for benchmarking methodology.</p>
        </div>
      </div>
    </section>
  );
}
