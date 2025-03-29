import { resolve } from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import { defineWebExtConfig } from "wxt";

await readdir(".wxt").catch(() => mkdir(".wxt"));
await readdir(".wxt/chrome-data").catch(() => mkdir(".wxt/chrome-data"));

export default defineWebExtConfig({
  chromiumProfile: resolve(".wxt/chrome-data"),
  keepProfileChanges: true
});