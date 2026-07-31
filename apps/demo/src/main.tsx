import "./ga";
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const root = document.getElementById("root");

if (!root) {
  throw new Error("React Pixel UI demo root element was not found.");
}

if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
