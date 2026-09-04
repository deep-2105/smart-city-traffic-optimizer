"use client";

import { useEffect, useState } from "react";
import { dijkstra, type DijkstraCostMode, type DijkstraResult } from "@/algorithms/dijkstra";
import { kruskalMST, primMST, type MSTAlgorithm, type MSTResult } from "@/algorithms/mst";
import { bfs, dfs } from "@/algorithms/traversal";
import CityTrafficNetwork from "@/components/CityTrafficNetwork";
import TrafficAnalysis from "@/components/TrafficAnalysis";
import { trafficGraph } from "@/data/trafficGraph";
import type { GraphEdge, GraphNode } from "@/types/trafficGraph";

const navigation = [
  ["01", "Dashboard", "▦"], ["02", "City Network", "⌘"], ["03", "Route Optimization", "↗"],
  ["04", "Traffic Analysis", "◒"], ["05", "Infrastructure Planning", "⌂"], ["06", "Performance", "↗"],
] as const;

const stats = [
  { label: "Active Roads", value: "1,284", unit: "", detail: "+3.8% this week", tone: "cyan", icon: "↗" },
  { label: "Congested Roads", value: "47", unit: "", detail: "−12.4% today", tone: "amber", icon: "◌" },
  { label: "Average Travel Time", value: "24.6", unit: "min", detail: "−2.1 min vs. baseline", tone: "blue", icon: "◷" },
  { label: "Active Routes", value: "9,842", unit: "", detail: "+8.7% this month", tone: "violet", icon: "⌁" },
] as const;

type RouteObjective = "Fastest route" | "Shortest distance";

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [source, setSource] = useState<GraphNode | null>(null);
  const [destination, setDestination] = useState<GraphNode | null>(null);
  const [objective, setObjective] = useState<RouteObjective>("Fastest route");
  const [routeResult, setRouteResult] = useState<DijkstraResult | null>(null);
  const [mstAlgorithm, setMstAlgorithm] = useState<MSTAlgorithm>("Prim");
  const [mstResult, setMstResult] = useState<MSTResult | null>(null);
  const [focusedTrafficRoadId, setFocusedTrafficRoadId] = useState<string | null>(null);
  const [traversalStart, setTraversalStart] = useState("A1");
  const [traversalAlgorithm, setTraversalAlgorithm] = useState<"BFS" | "DFS">("BFS");
  const [traversalSteps, setTraversalSteps] = useState<string[]>([]);
  const [visitedNodeIds, setVisitedNodeIds] = useState<Set<string>>(new Set());
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [traversalStatus, setTraversalStatus] = useState("Ready to run");

  useEffect(() => {
    if (traversalSteps.length === 0) return;
    let step = 0;
    const timer = window.setInterval(() => {
      const nextNodeId = traversalSteps[step];
      setCurrentNodeId(nextNodeId);
      setVisitedNodeIds(new Set(traversalSteps.slice(0, step + 1)));
      step += 1;
      if (step >= traversalSteps.length) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          setCurrentNodeId(null);
          setTraversalStatus("Complete");
        }, 350);
      }
    }, 400);
    return () => window.clearInterval(timer);
  }, [traversalSteps]);

  const runTraversal = () => {
    const result = traversalAlgorithm === "BFS" ? bfs(trafficGraph, traversalStart) : dfs(trafficGraph, traversalStart);
    setVisitedNodeIds(new Set());
    setCurrentNodeId(null);
    setTraversalStatus("Running");
    setTraversalSteps(result.order);
  };

  const resetTraversal = () => {
    setTraversalSteps([]);
    setVisitedNodeIds(new Set());
    setCurrentNodeId(null);
    setTraversalStatus("Ready to run");
  };

  const handleSelectionChange = (selectedSource: GraphNode | null, selectedDestination: GraphNode | null) => {
    setSource(selectedSource);
    setDestination(selectedDestination);
    setRouteResult(null);
  };

  const selectRouteNode = (role: "source" | "destination", nodeId: string) => {
    const node = trafficGraph.nodes.find((graphNode) => graphNode.id === nodeId) ?? null;
    if (role === "source") {
      handleSelectionChange(node, destination);
      return;
    }
    handleSelectionChange(source, node);
  };

  const swapRouteEndpoints = () => {
    handleSelectionChange(destination, source);
  };

  const resetNetworkSelection = () => {
    handleSelectionChange(null, null);
    setMstResult(null);
    setFocusedTrafficRoadId(null);
    resetTraversal();
  };

  const changeRouteObjective = (nextObjective: RouteObjective) => {
    setObjective(nextObjective);
    setRouteResult(null);
  };

  const findOptimalRoute = () => {
    if (!source || !destination) return;
    const costMode: DijkstraCostMode = objective === "Fastest route" ? "traffic" : "distance";
    setRouteResult(dijkstra(trafficGraph, source.id, destination.id, costMode));
  };

  const calculateMst = () => {
    setMstResult(mstAlgorithm === "Prim" ? primMST(trafficGraph) : kruskalMST(trafficGraph));
  };

  const changeMstAlgorithm = (nextAlgorithm: MSTAlgorithm) => {
    setMstAlgorithm(nextAlgorithm);
    setMstResult(null);
  };

  return (
    <div className="dashboard-shell">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">+</span>
            <span>URBAN<span className="brand-accent">GRID</span></span>
          </div>
          <div className="workspace-label">CONTROL CENTER <span>v2.4.0</span></div>
          <nav aria-label="Main navigation">
            {navigation.map(([number, label, icon]) => (
              <button className={`nav-item ${activePage === label ? "active" : ""}`} onClick={() => setActivePage(label)} key={label}>
                <span className="nav-number">{number}</span>
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="operator">
              <span className="avatar">AM</span>
              <span><strong>Alex Morgan</strong><small>System operator</small></span>
              <span className="more">•••</span>
            </div>
            <div className="sidebar-foot">CAPSTONE PROJECT <span>2024 / 25</span></div>
          </div>
        </aside>
        <main className="main-content">
          <header className="topbar">
            <div>
              <div className="project-title">Smart City Traffic Management <span>&amp; Route Optimization System</span></div>
              <div className="breadcrumb">
                <span>OVERVIEW</span><b>/</b> {activePage.toUpperCase()}
              </div>
            </div>
            <div className="topbar-actions">
              <span className="live-status"><i /> System Operational</span>
              <span className="header-time">09:41:28 <small>IST</small></span>
              <button className="icon-button" aria-label="Notifications">♧<span className="notification-dot" /></button>
            </div>
          </header>
          <div className="content-wrap">
            <section className="intro">
              <div>
                <p className="eyebrow">WEDNESDAY, 06 NOVEMBER 2024 <span className="eyebrow-line" /></p>
                <h1>Good morning, <em>Alex.</em></h1>
                <p className="intro-copy">Here&apos;s what&apos;s happening across the city network today.</p>
              </div>
              <div className="refresh-info"><span className="refresh-icon">↻</span> Updated just now</div>
            </section>
            <section className="stats-grid" aria-label="Network statistics">
              {stats.map((stat) => (
                <article className={`stat-card stat-${stat.tone}`} key={stat.label}>
                  <div className="stat-top">
                    <span>{stat.label}</span>
                    <span className="stat-icon">{stat.icon}</span>
                  </div>
                  <div className="stat-value">{stat.value}<small>{stat.unit}</small></div>
                  <div className="stat-detail"><span className="up">↗</span> {stat.detail}</div>
                </article>
              ))}
            </section>
            <section className="dashboard-grid">
              <article className="panel network-panel">
                <div className="panel-heading">
                  <div>
                    <p className="panel-kicker">LIVE OVERVIEW</p>
                    <h2>City Traffic Network</h2>
                  </div>
                  <button className="outline-button">Full network <span>↗</span></button>
                </div>
                <CityTrafficNetwork source={source} destination={destination} onSelectionChange={handleSelectionChange} onResetSelection={resetNetworkSelection} visitedNodeIds={visitedNodeIds} currentNodeId={currentNodeId} routeNodeIds={routeResult?.path ?? []} mstEdgeIds={mstResult?.selectedEdgeIds ?? []} focusedRoadId={focusedTrafficRoadId} />
              </article>
              <TrafficAnalysis graph={trafficGraph} focusedRoadId={focusedTrafficRoadId} onRoadSelect={(road: GraphEdge) => setFocusedTrafficRoadId(road.id)} />
            </section>
            <section className="traversal-panel panel">
              <div className="panel-heading">
                <div><p className="panel-kicker">GRAPH TRAVERSAL</p><h2>Explore the network</h2></div>
                <span className={`traversal-status status-${traversalStatus.toLowerCase().replaceAll(" ", "-")}`}><i /> {traversalStatus}</span>
              </div>
              <div className="traversal-layout">
                <div className="traversal-controls">
                  <label>Start node<select value={traversalStart} onChange={(event) => setTraversalStart(event.target.value)}>{trafficGraph.nodes.map((node) => <option value={node.id} key={node.id}>{node.id} · {node.name}</option>)}</select></label>
                  <label>Algorithm<select value={traversalAlgorithm} onChange={(event) => setTraversalAlgorithm(event.target.value as "BFS" | "DFS")}><option value="BFS">BFS</option><option value="DFS">DFS</option></select></label>
                  <div className="traversal-buttons"><button className="route-button" type="button" onClick={runTraversal}>Run traversal <span>→</span></button><button className="reset-button" type="button" onClick={resetTraversal}>Reset</button></div>
                </div>
                <div className="traversal-result"><div className="result-metric"><span>Nodes visited</span><strong>{visitedNodeIds.size}<small> / {traversalSteps.length || "—"}</small></strong></div><div className="result-order"><span>Traversal order</span><p>{traversalSteps.length > 0 ? traversalSteps.join(" → ") : "Run an algorithm to see the visit sequence."}</p></div></div>
                <div className="algorithm-explanation"><div><strong>BFS</strong><span>Queue · level by level</span><small>Time O(V + E) · Space O(V)</small></div><div><strong>DFS</strong><span>Stack · deep exploration</span><small>Time O(V + E) · Space O(V)</small></div><p>Both methods explore the unweighted network without calculating route distance.</p></div>
              </div>
            </section>
            <section className="lower-grid">
              <article className="panel route-panel">
                <div className="panel-heading">
                  <div>
                    <p className="panel-kicker">PLANNING TOOL</p>
                    <h2>Route Optimization</h2>
                  </div>
                  <span className="beta-tag">BETA</span>
                </div>
                <div className="route-form">
                  <label>Source
                    <select className="route-selection" value={source?.id ?? ""} onChange={(event) => selectRouteNode("source", event.target.value)}>
                      <option value="">Select on network</option>
                      {trafficGraph.nodes.map((node) => <option value={node.id} key={node.id}>{node.id} · {node.name}</option>)}
                    </select>
                  </label>
                  <button className="swap" type="button" onClick={swapRouteEndpoints} disabled={!source || !destination} aria-label="Swap source and destination" title="Swap source and destination">⇄</button>
                  <label>Destination
                    <select className="route-selection" value={destination?.id ?? ""} onChange={(event) => selectRouteNode("destination", event.target.value)}>
                      <option value="">Select on network</option>
                      {trafficGraph.nodes.map((node) => <option value={node.id} key={node.id}>{node.id} · {node.name}</option>)}
                    </select>
                  </label>
                  <label>Optimization objective
                    <select value={objective} onChange={(event) => changeRouteObjective(event.target.value as RouteObjective)} aria-label="Optimization objective">
                      <option>Fastest route</option>
                      <option>Shortest distance</option>
                    </select>
                  </label>
                  <button className="route-button" type="button" disabled={!source || !destination} onClick={findOptimalRoute}>Find optimal route <span>→</span></button>
                </div>
                {routeResult && <div className="route-result" role="status">
                  {routeResult.reachable ? <>
                    <div className="route-result-heading"><strong>Optimal Route</strong><span>Algorithm: Dijkstra</span></div>
                    {source?.id === destination?.id && <p className="route-message">Source and destination are the same. This route has zero distance.</p>}
                    <dl className="route-metrics">
                      <div><dt>Source</dt><dd>{source?.id} · {source?.name}</dd></div>
                      <div><dt>Destination</dt><dd>{destination?.id} · {destination?.name}</dd></div>
                      <div><dt>Optimization</dt><dd>{objective}</dd></div>
                      <div><dt>Total distance</dt><dd>{routeResult.totalDistance?.toFixed(1)} km</dd></div>
                      {objective === "Fastest route" && <div><dt>Traffic-adjusted cost</dt><dd>{routeResult.totalCost?.toFixed(2)}</dd></div>}
                      <div><dt>Nodes in route</dt><dd>{routeResult.path.length}</dd></div>
                      <div><dt>Nodes visited</dt><dd>{routeResult.visitedCount}</dd></div>
                    </dl>
                    <div className="route-path"><span>Nodes in route</span><p>{routeResult.path.join(" → ")}</p></div>
                  </> : <><div className="route-result-heading"><strong>No route available</strong><span>Algorithm: Dijkstra</span></div><p className="route-message">No connected route exists between the selected intersections.</p></>}
                  {objective === "Fastest route" && <p className="route-message">Fastest route uses road distance weighted by current traffic conditions.</p>}
                  <p className="dijkstra-explanation">Dijkstra&apos;s algorithm finds the shortest weighted path from a source node to a destination node by repeatedly selecting the closest unvisited node and relaxing its neighboring edges. Shortest distance uses road distance as the edge weight; fastest route uses road distance × traffic multiplier.</p>
                  <p className="dijkstra-complexity">Time: O((V + E) log V) · Space: O(V)</p>
                </div>}
              </article>
              <article className="panel infrastructure-panel">
                <div className="panel-heading">
                  <div>
                    <p className="panel-kicker">INFRASTRUCTURE PLANNING</p>
                    <h2>Minimum Spanning Tree</h2>
                  </div>
                  <span className={`mst-status ${mstResult ? "mst-calculated" : ""}`}>{mstResult ? "MST calculated" : "Ready to calculate"}</span>
                </div>
                <p className="infrastructure-copy">Find the minimum-distance road network that connects every intersection.</p>
                <div className="mst-controls">
                  <label>Algorithm
                    <select value={mstAlgorithm} onChange={(event) => changeMstAlgorithm(event.target.value as MSTAlgorithm)}>
                      <option value="Prim">Prim</option>
                      <option value="Kruskal">Kruskal</option>
                    </select>
                  </label>
                  <button className="route-button" type="button" onClick={calculateMst}>Calculate MST <span>→</span></button>
                </div>
                {mstResult && <div className="mst-result" role="status">
                  <dl className="mst-metrics">
                    <div><dt>Algorithm</dt><dd>{mstResult.algorithm}</dd></div>
                    <div><dt>Total infrastructure distance</dt><dd>{mstResult.totalDistance.toFixed(1)} km</dd></div>
                    <div><dt>Roads selected</dt><dd>{mstResult.edgesSelected} / {Math.max(trafficGraph.nodes.length - 1, 0)}</dd></div>
                    <div><dt>Intersections connected</dt><dd>{mstResult.nodesConnected} / {trafficGraph.nodes.length}</dd></div>
                    <div><dt>Network status</dt><dd className={mstResult.isConnected ? "mst-connected" : "mst-disconnected"}>{mstResult.isConnected ? "Connected" : "Disconnected"}</dd></div>
                  </dl>
                  <div className="mst-roads"><span>Selected roads</span>{mstResult.selectedEdges.length > 0 ? <ul>{mstResult.selectedEdges.map((edge) => <li key={edge.id}>{edge.source} — {edge.target} <small>{edge.distance} km</small></li>)}</ul> : <p>No roads are required.</p>}</div>
                  <p className="mst-explanation"><strong>Prim</strong> grows from a starting node using the cheapest expansion edge. <strong>Kruskal</strong> sorts roads by distance and adds the cheapest edge that does not create a cycle. Both produce a minimum spanning tree for a connected weighted graph.</p>
                  <p className="dijkstra-complexity">Prim: O((V + E) log V) · Kruskal: O(E log E) · Space: O(V + E)</p>
                </div>}
              </article>
            </section>
            <footer>
              <span>SMART CITY TRAFFIC MANAGEMENT SYSTEM</span>
              <span>Built for better movement <b>·</b> <strong>UrbanGrid Labs</strong></span>
            </footer>
          </div>
        </main>
    </div>
  );
}
