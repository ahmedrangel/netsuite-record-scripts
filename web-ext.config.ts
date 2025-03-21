import { defineRunnerConfig } from "wxt";
import { resolve } from "node:path";
import { mkdir, readdir } from "node:fs/promises";
await readdir(".wxt/chrome-data").catch(() => mkdir(".wxt/chrome-data"));

export default defineRunnerConfig({
  chromiumProfile: resolve(".wxt/chrome-data"),
  keepProfileChanges: true
});