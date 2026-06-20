export type Route =
  | { view: "home" }
  | { view: "properties" }
  | { view: "property"; id: string }
  | { view: "about" }
  | { view: "contact" };

export type Nav = (r: Route) => void;
