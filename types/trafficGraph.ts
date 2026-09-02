export type TrafficCondition = "normal" | "moderate" | "heavy";

export type GraphNode = {
  id: string;
  name: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  distance: number;
  condition: TrafficCondition;
  trafficMultiplier: number;
};

export type TrafficGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
