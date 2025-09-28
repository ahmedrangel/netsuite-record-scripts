import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json" with { type: "json" };

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue", "@wxt-dev/auto-icons"],
  srcDir: "src",
  manifest: {
    name: pkg.title,
    description: pkg.description,
    version: pkg.version,
    action: {},
    permissions: ["activeTab", "scripting"],
    host_permissions: ["https://*.netsuite.com/*"]
  },
  webExt: {
    startUrls: ["https://system.netsuite.com/"]
  },
  autoIcons: {
    developmentIndicator: false
  },
  vite: () => ({
    plugins: [
      tailwindcss()
    ]
  })
});
