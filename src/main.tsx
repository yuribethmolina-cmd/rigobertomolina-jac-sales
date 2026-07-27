import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { RELEASE_ID } from "./lib/release";

console.info(`[Release] ${RELEASE_ID}`);

const root = document.getElementById("root")!;
root.setAttribute("data-release-id", RELEASE_ID);
createRoot(root).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);

export { RELEASE_ID };
