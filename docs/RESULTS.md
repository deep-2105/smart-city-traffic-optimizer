# Results and Observations

This document records representative observations from the current simulated graph. Values are derived from the sample graph and may change when its nodes, roads, distances, or traffic conditions change.

## City Network

| Property | Result |
| --- | --- |
| Intersections | 11 |
| Roads | 16 |
| Graph type | Undirected weighted graph |
| Base road weight | Physical distance in kilometres |

## Traffic Analysis

The Traffic Analysis module calculates road-condition counts and congestion from the graph at runtime.

| Traffic condition | Current sample count |
| --- | --- |
| Normal | 8 |
| Moderate | 5 |
| Heavy | 3 |

The current congestion percentage is:

$$
\frac{5 + 3}{16} \times 100 = 50\%
$$

The module also ranks the most congested roads using traffic severity, traffic multiplier, and road ID as deterministic tie breakers. It reports average road distance, total network distance, average multiplier, and dynamic network insights.

## Route Optimization

Representative observed shortest-distance result:

```text
A1 -> A2 -> B3 -> C3
Physical distance: 12.1 km
```

Dijkstra provides two modes:

- **Shortest distance:** physical road distance is the cost.
- **Fastest route:** physical distance multiplied by the existing simulated traffic multiplier is the cost.

Fastest-route output includes a traffic-adjusted cost, but it is not claimed to be actual travel time. The current project uses simulated traffic conditions, not live traffic feeds.

## Infrastructure Planning

For a connected graph with $V$ intersections, an MST contains $V - 1$ roads. With 11 intersections, the current graph therefore requires 10 selected roads for a complete MST.

Both Prim and Kruskal were manually verified on the current graph:

| Algorithm | Selected roads | Connected intersections | Total distance |
| --- | --- | --- | --- |
| Prim | 10 | 11 / 11 | 31.0 km |
| Kruskal | 10 | 11 / 11 | 31.0 km |

The algorithms may choose different valid edge sets when weights permit alternatives; their total physical infrastructure distance should match for the same connected graph.

## Performance

Performance Analysis benchmarks the existing implementations of:

- BFS: `O(V + E)` standard traversal model.
- DFS: `O(V + E)` standard traversal model.
- Dijkstra: current literal worst case `O(VE + E log V)` because it scans the edge list during relaxation.
- Prim: `O(E log E)` for the current candidate-edge heap implementation.
- Kruskal: `O(E log E)`.

The benchmark uses browser-local `performance.now()` measurements. Exact timing results are machine- and browser-dependent and should not be interpreted as real-world city-scale benchmarks.

## Decision Support

Decision Support generates deterministic recommendations from the current graph, traffic analysis, Dijkstra results, and MST results. It provides:

- Commuter route recommendations.
- Congestion warnings based on route edges.
- City-administrator congestion priorities.
- MST-backed infrastructure recommendations.
- Top intervention priority roads ranked by `trafficMultiplier * distance`.

These are project decision-support indicators based on simulated data, not live traffic forecasts or real-world engineering assessments.
