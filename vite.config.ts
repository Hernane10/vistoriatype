import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite >= 5.4.12 rejects requests whose Host header is not explicitly allowed
// (403 "Blocked request"). In the Base44 sandbox the preview proxy forwards
// Host: <port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN, so that domain has to
// be allowed or the preview shows an empty frame. Sandbox-only: applied when
// BASE44_PREVIEW_MODE is exactly "1" and the domain is known; otherwise
// allowedHosts stays undefined and Vite keeps its own default list.
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;
const sandboxAllowedHosts =
  process.env.BASE44_PREVIEW_MODE === "1" && sandboxHostDomain
    ? [`.${sandboxHostDomain}`]
    : [];

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Vite's default list (localhost/127.0.0.1/[::1]) plus the sandbox
    // wildcard — keeping the defaults so local/healthcheck requests still work.
    allowedHosts: [
      "localhost",
      ".localhost",
      "127.0.0.1",
      "[::1]",
      ...sandboxAllowedHosts,
    ],
  },
});
