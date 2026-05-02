import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RELEASE_ID } from "./lib/release";

console.info(`[Release] ${RELEASE_ID}`);

const root = document.getElementById("root")!;
root.setAttribute("data-release-id", RELEASE_ID);
createRoot(root).render(<App />);

export { RELEASE_ID };
