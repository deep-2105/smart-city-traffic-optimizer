# Algorithm Reference

All algorithms operate on the typed `TrafficGraph` defined in `types/trafficGraph.ts`. The current network treats roads as undirected. Infrastructure algorithms use physical distance only; Dijkstra can also use simulated traffic weighting.

## Breadth-First Search (BFS)

| Aspect | Description |
| --- | --- |
| Purpose | Unweighted network traversal level by level |
| Input | Graph and a valid start-node ID |
| Output | Visit order, visited-node set, and visited count |
| How it works | Maintains a queue and visits unvisited neighbours in breadth-first order |
| Time complexity | `O(V + E)` in the standard adjacency-list model; current neighbour lookup scans the edge list |
| Space complexity | `O(V)` |
| Application use | Graph Traversal panel and network exploration |

## Depth-First Search (DFS)

| Aspect | Description |
| --- | --- |
| Purpose | Deep exploration of the network |
| Input | Graph and a valid start-node ID |
| Output | Visit order, visited-node set, and visited count |
| How it works | Maintains a stack, follows a branch deeply, then backtracks to remaining neighbours |
| Time complexity | `O(V + E)` in the standard adjacency-list model; current neighbour lookup scans the edge list |
| Space complexity | `O(V)` |
| Application use | Graph Traversal panel and network exploration |

## Dijkstra's Algorithm

| Aspect | Description |
| --- | --- |
| Purpose | Compute a non-negative weighted shortest path |
| Input | Graph, start-node ID, destination-node ID, and optional cost mode |
| Output | Path, physical total distance, optimized total cost, visited nodes/count, and reachability status |
| How it works | Initializes source distance to zero, repeatedly finalizes the least-cost node from a binary min-heap, relaxes connecting roads, and reconstructs predecessors |
| Time complexity | `O(VE + E log V)` in the current implementation because each finalized node scans the complete edge list; `O((V + E) log V)` would apply to an adjacency-list variant |
| Space complexity | `O(V)` |
| Application use | Route Optimization, traffic-aware fastest routing, Performance Analysis, and Decision Support |

### Cost Modes

| Mode | Edge cost |
| --- | --- |
| Shortest distance | Physical road distance |
| Fastest route | Physical road distance × existing traffic multiplier |

The fastest-route cost is a simulated traffic-weighted indicator, not an actual travel-time prediction.

## Prim's Algorithm

| Aspect | Description |
| --- | --- |
| Purpose | Construct a minimum spanning tree from a deterministic starting node |
| Input | Undirected weighted graph |
| Output | Selected edges/IDs, total distance, connected-node count, edge count, and connectivity status |
| How it works | Starts at the first graph node, pushes incident roads into a binary min-heap, and repeatedly adds the least-distance edge that expands the connected set |
| Time complexity | `O(E log E)` for the current candidate-edge heap implementation |
| Space complexity | `O(V + E)` |
| Application use | Infrastructure Planning, graph MST highlighting, Performance Analysis, and Decision Support |

Physical road distance is the infrastructure weight. Traffic multipliers are not used.

## Kruskal's Algorithm

| Aspect | Description |
| --- | --- |
| Purpose | Construct a minimum spanning tree using globally sorted roads and cycle detection |
| Input | Undirected weighted graph |
| Output | Selected edges/IDs, total distance, connected-node count, edge count, and connectivity status |
| How it works | Sorts roads by physical distance and uses union-find with path compression and union by rank; an edge is accepted only when it connects different components |
| Time complexity | `O(E log E)` because edge sorting dominates |
| Space complexity | `O(V + E)` |
| Application use | Infrastructure Planning, graph MST highlighting, Performance Analysis, and Decision Support |

Physical road distance is the infrastructure weight. A connected graph with $V$ vertices has $V - 1$ MST edges.

## Related Analysis

`algorithms/trafficAnalysis.ts` is not a graph traversal or optimization algorithm. It makes one pass through road data to derive summary metrics, then sorts roads for congestion ranking. Its analysis pass is `O(E)`, ranking is `O(E log E)`, and space use is `O(E)`.
