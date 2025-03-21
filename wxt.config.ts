import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    action: {},
    permissions: ["activeTab", "scripting"]
  },
  runner: {
    startUrls: ["https://system.netsuite.com/"]
  },
  // @ts-ignore
  vite: () => ({
    plugins: [
      tailwindcss()
    ]
  })
});
