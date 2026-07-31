import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import "./index.css";

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
