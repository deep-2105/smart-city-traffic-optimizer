# Testing and Validation

## Scope

Validation for this capstone consists of static validation, production build validation, manual functional testing, integration testing, and responsive UI checking. The project does not currently include an automated test suite or coverage report.

## Static Validation

```bash
npm run lint
```

Runs ESLint across the project. This validates configured code-quality rules and TypeScript-aware linting for the application source.

## Production Build Validation

```bash
npm run build
```

Runs the Next.js production build, including TypeScript validation, compilation, and static page generation.

## Manual and Integration Test Matrix

The following functionality was manually verified during development against the current simulated sample graph. Results can change if graph data or implementation changes.

| Test ID | Module | Test | Expected Result | Status |
| --- | --- | --- | --- | --- |
| T01 | City graph | Render the interactive city network | All intersections and roads render with traffic styling | Verified |
| T02 | Route selection | Select a source intersection | Source state and map highlight update | Verified |
| T03 | Route selection | Select a destination intersection | Destination state and map highlight update | Verified |
| T04 | Route selection | Select endpoints on map and in dropdowns | Graph and selectors remain synchronized | Verified |
| T05 | Route selection | Use swap control | Source and destination exchange | Verified |
| T06 | Route selection | Reset selection | Endpoints, route result, MST result, and focused road state clear | Verified |
| T07 | Traversal | Run BFS | Traversal order and visualization update | Verified |
| T08 | Traversal | Run DFS | Traversal order and visualization update | Verified |
| T09 | Dijkstra | Run representative A1 to C3 route | A valid shortest route and distance display | Verified |
| T10 | Route optimization | Run Fastest route | Traffic-weighted Dijkstra cost and highlighted route display | Verified |
| T11 | Route optimization | Run Shortest distance | Distance-weighted Dijkstra route and distance display | Verified |
| T12 | Traffic Analysis | Inspect metrics and ranked roads | Dynamic counts, distribution, congestion, insights, and top roads display | Verified |
| T13 | Infrastructure Planning | Run Prim | MST result displays a connected 10-road tree on current graph | Verified |
| T14 | Infrastructure Planning | Run Kruskal | MST result displays a connected 10-road tree on current graph | Verified |
| T15 | City graph | Inspect MST visualization | MST roads highlight while other roads remain visible | Verified |
| T16 | Performance Analysis | Run and reset benchmark | Five existing algorithms are measured locally and output clears on reset | Verified |
| T17 | Decision Support | Open decision-support section | Deterministic summary and two decision perspectives display | Verified |
| T18 | Decision Support | Select commuter route | Shortest/fastest comparison and traffic alerts reflect route data | Verified |
| T19 | Decision Support | Calculate MST then inspect administrator guidance | Congestion, priority, and infrastructure recommendations update | Verified |
| T20 | Responsive UI | Check desktop, tablet, and mobile widths | Dashboard controls and panels remain usable | Verified |

## Representative Algorithm Test Cases

### Dijkstra

Representative sample result for the current graph:

```text
Start: A1
Destination: C3
Route: A1 -> A2 -> B3 -> C3
Physical distance: 12.1 km
```

This is an observed sample result, not a fixed guarantee if the graph data changes. Both shortest-distance and traffic-aware fastest-route modes were manually exercised. Same-source/destination routing was also manually checked and returns a valid zero-distance route.

### Traffic Analysis

The current graph dynamically produces:

| Metric | Current sample value |
| --- | --- |
| Intersections | 11 |
| Roads | 16 |
| Normal roads | 8 |
| Moderate roads | 5 |
| Heavy roads | 3 |
| Congestion | 50% |

Congestion is derived as `(moderate + heavy) / total roads * 100`. These values are calculated from the current sample graph and are not hardcoded dashboard results.

### Minimum Spanning Tree

For the current connected 11-node graph, the expected MST edge count is $V - 1 = 10$. Prim and Kruskal were both manually tested and each selected 10 roads, connected all 11 intersections, and produced a total physical distance of 31.0 km for the current graph.

### Performance Analysis

The browser-local benchmark runs BFS, DFS, Dijkstra, Prim, and Kruskal. It uses `performance.now()` around the existing implementation calls. Exact durations are intentionally not recorded as permanent results because they vary by browser, machine, and runtime conditions.

## Responsive Checking

Responsive checks were performed on desktop and mobile browser viewports during development. The visual dashboard uses responsive grid rules and horizontally scrollable tables where necessary. A formal device-lab or accessibility audit has not been recorded and remains outside the current evidence set.

## Evidence Checklist

Screenshots can be added to `docs/screenshots/` when captured from the application.

- [ ] Dashboard screenshot
- [ ] Interactive city graph screenshot
- [ ] BFS traversal screenshot
- [ ] DFS traversal screenshot
- [ ] Dijkstra route screenshot
- [ ] Fastest route screenshot
- [ ] Shortest distance screenshot
- [ ] Traffic Analysis screenshot
- [ ] Prim MST screenshot
- [ ] Kruskal MST screenshot
- [ ] Performance Analysis screenshot
- [ ] Decision Support screenshot
- [ ] Final deployed application screenshot
