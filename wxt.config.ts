import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-vue", "@wxt-dev/auto-icons"],
  srcDir: "src",
  manifest: {
    name: "NetSuite Record Scripts",
    description: "Instantly view all scripts deployed on a NetSuite record with just one click!",
    action: {},
    permissions: ["activeTab", "scripting"]
  },
  runner: {
    startUrls: ["https://system.netsuite.com/"]
  },
  autoIcons: {
    grayscaleOnDevelopment: false
  },
  // @ts-ignore
  vite: () => ({
    plugins: [
      tailwindcss()
    ]
  })
});
