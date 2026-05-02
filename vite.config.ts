import { defineConfig } from "vite";
import path from "path";
import { readFileSync } from "fs";

// Read RELEASE_ID from src/lib/release.ts at build/dev start so we can
// inject it into index.html for cache-busting static assets (favicon, manifest).
function readReleaseId(): string {
  try {
    const src = readFileSync(
      path.resolve(__dirname, "src/lib/release.ts"),
      "utf-8",
    );
    const match = src.match(/RELEASE_ID\s*=\s*["'`]([^"'`]+)["'`]/);
    return match?.[1] ?? "dev";
  } catch {
    return "dev";
  }
}

export default defineConfig(({ command }) => {
  // In dev, append a timestamp so the favicon refreshes on every reload.
  // In build, use the pinned RELEASE_ID for stable, version-based busting.
  const releaseId =
    command === "serve" ? `${readReleaseId()}-${Date.now()}` : readReleaseId();

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      {
        name: "inject-release-id",
        transformIndexHtml(html) {
          return html.replaceAll("__RELEASE_ID__", releaseId);
        },
      },
    ],
  };
});
