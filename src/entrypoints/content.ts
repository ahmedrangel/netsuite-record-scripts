import { editorInject } from "@/utils/editor";

export default defineContentScript({
  matches: ["https://*.netsuite.com/*"],
  async main () {
    await editorInject();
  }
});
