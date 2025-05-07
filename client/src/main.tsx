import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { StrictMode } from "react";
import { removeReplitMetadata } from "./utils/metadata-fixer";

// Remove Replit metadata attributes when running in production (e.g., on Netlify)
removeReplitMetadata();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
