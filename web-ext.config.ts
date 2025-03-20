import { defineRunnerConfig } from "wxt";
import { resolve } from "node:path";

export default defineRunnerConfig({
  chromiumProfile: resolve(".wxt/chrome-data"),
  keepProfileChanges: true
});