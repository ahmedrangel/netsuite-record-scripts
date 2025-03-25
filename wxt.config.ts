import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json" with { type: "json" };

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-vue", "@wxt-dev/auto-icons"],
  srcDir: "src",
  manifest: {
    name: pkg.title,
    description: pkg.description,
    version: pkg.version,
    action: {},
    permissions: ["tabs", "activeTab", "scripting"]
  },
  runner: {
    startUrls: ["https://system.netsuite.com/"]
  },
  autoIcons: {
    grayscaleOnDevelopment: false
  },
  vite: () => ({
    plugins: [
      tailwindcss()
    ]
  })
});
