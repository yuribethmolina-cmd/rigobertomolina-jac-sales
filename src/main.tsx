import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const RELEASE_ID = "v20260318-1200";
console.info(`[Release] ${RELEASE_ID}`);

const root = document.getElementById("root")!;
root.setAttribute("data-release-id", RELEASE_ID);
createRoot(root).render(<App />);

export { RELEASE_ID };
