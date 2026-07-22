import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { demoSeedFromSearch } from "./config";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App seed={demoSeedFromSearch(window.location.search)} /></React.StrictMode>
);
