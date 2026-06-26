import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const pushState = window.history.pushState;
window.history.pushState = function (...args) {
  const result = pushState.apply(this, args);
  window.dispatchEvent(new Event("locationchange"));
  return result;
};

const replaceState = window.history.replaceState;
window.history.replaceState = function (...args) {
  const result = replaceState.apply(this, args);
  window.dispatchEvent(new Event("locationchange"));
  return result;
};

window.addEventListener("popstate", () => {
  window.dispatchEvent(new Event("locationchange"));
});

createRoot(document.getElementById("root")!).render(<App />);
