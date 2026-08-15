import { resolve } from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import { APP } from "../src/utils/app";

await readdir(".wxt").catch(() => mkdir(".wxt"));
await readdir(".wxt/chrome-data").catch(() => mkdir(".wxt/chrome-data"));

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue", "@wxt-dev/auto-icons"],
  srcDir: "src",
  manifest: {
    name: APP.name,
    description: APP.description,
    version: APP.version,
    action: {},
    permissions: ["activeTab", "scripting", "storage"],
    host_permissions: ["https://*.netsuite.com/*"]
  },
  webExt: {
    startUrls: ["https://system.netsuite.com/"],
    chromiumProfile: resolve(".wxt/chrome-data"),
    keepProfileChanges: true
  },
  autoIcons: {
    developmentIndicator: false
  },
  vite: () => ({
    plugins: [
      tailwindcss()
    ]
  }),
  alias: {
    N: resolve("node_modules/@btonasse/suitescript-types/types/N")
  }
});
