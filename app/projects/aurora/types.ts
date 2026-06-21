export type Route =
  | { view: "home" }
  | { view: "voyages" }
  | { view: "voyage"; id: string }
  | { view: "fleet" }
  | { view: "contact" };

export type Nav = (r: Route) => void;
