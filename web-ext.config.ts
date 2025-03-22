import { resolve } from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import { defineRunnerConfig } from "wxt";

await readdir(".wxt").catch(() => mkdir(".wxt"));
await readdir(".wxt/chrome-data").catch(() => mkdir(".wxt/chrome-data"));

export default defineRunnerConfig({
  chromiumProfile: resolve(".wxt/chrome-data"),
  keepProfileChanges: true
});