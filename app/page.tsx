"use client";

import { useState } from "react";
import CityTrafficNetwork from "@/components/CityTrafficNetwork";
import type { GraphNode } from "@/types/trafficGraph";

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

const trafficLevels = [
  { label: "Normal", count: "842 roads", percent: "66%", color: "green" },
  { label: "Moderate", count: "395 roads", percent: "31%", color: "amber" },
  { label: "Heavy", count: "47 roads", percent: "3%", color: "red" },
] as const;

const algorithms = [["BFS / DFS", "Network traversal", "Ready"], ["Dijkstra", "Shortest path", "Ready"], ["Prim / Kruskal", "Minimum spanning tree", "Planned"]] as const;

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [source, setSource] = useState<GraphNode | null>(null);
  const [destination, setDestination] = useState<GraphNode | null>(null);
  const [objective, setObjective] = useState("Fastest route");
  const [routeMessage, setRouteMessage] = useState("");
  const handleSelectionChange = (selectedSource: GraphNode | null, selectedDestination: GraphNode | null) => {
    setSource(selectedSource);
    setDestination(selectedDestination);
    setRouteMessage("");
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
                <CityTrafficNetwork onSelectionChange={handleSelectionChange} />
              </article>
              <article className="panel conditions-panel">
                <div className="panel-heading">
                  <div>
                    <p className="panel-kicker">CURRENT SNAPSHOT</p>
                    <h2>Traffic Conditions</h2>
                  </div>
                  <span className="trend">↗ 6.2%</span>
                </div>
                <div className="condition-total"><strong>1,284</strong><span>monitored roads</span></div>
                <div className="condition-list">
                  {trafficLevels.map((level) => (
                    <div className="condition-row" key={level.label}>
                      <div className="condition-title">
                        <span className={`condition-dot ${level.color}`} />{level.label}<small>{level.count}</small><b>{level.percent}</b>
                      </div>
                      <div className="condition-bar"><span className={level.color} style={{ width: level.percent }} /></div>
                    </div>
                  ))}
                </div>
                <div className="condition-note"><span>!</span> 3 roads require immediate attention</div>
              </article>
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
                    <div className="route-selection">{source ? `${source.id} · ${source.name}` : "Select on network"}</div>
                  </label>
                  <span className="swap">⇄</span>
                  <label>Destination
                    <div className="route-selection">{destination ? `${destination.id} · ${destination.name}` : "Select on network"}</div>
                  </label>
                  <label>Optimization objective
                    <select value={objective} onChange={(event) => setObjective(event.target.value)}>
                      <option>Fastest route</option>
                      <option>Shortest distance</option>
                      <option>Lowest congestion</option>
                    </select>
                  </label>
                  <button className="route-button" disabled={!source || !destination} onClick={() => { if (source && destination) setRouteMessage(`${objective} from ${source.name} to ${destination.name} is ready for analysis.`); }}>Find optimal route <span>→</span></button>
                </div>
                {routeMessage && <p className="route-message" role="status">{routeMessage}</p>}
              </article>
              <article className="panel algorithms-panel">
                <div className="panel-heading">
                  <div>
                    <p className="panel-kicker">SYSTEM MODULES</p>
                    <h2>Algorithms</h2>
                  </div>
                  <span className="module-count">03</span>
                </div>
                <div className="algorithm-list">
                  {algorithms.map(([name, detail, status]) => (
                    <div className="algorithm-row" key={name}>
                      <span className="algorithm-symbol">{name === "Dijkstra" ? "◈" : name === "BFS / DFS" ? "⌘" : "◇"}</span>
                      <span><strong>{name}</strong><small>{detail}</small></span>
                      <b className={status === "Planned" ? "planned" : "ready"}>{status}</b>
                    </div>
                  ))}
                </div>
                <p className="algorithm-note">Core modules will connect to the network engine.</p>
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
