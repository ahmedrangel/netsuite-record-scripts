import { handlePopup } from "@/utils/helpers";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    (async () => {
      const currentTab = await browser.tabs.query({ active: true, currentWindow: true });
      const tabId = currentTab.find(tab => tab.active)?.id;
      if (!tabId) return;
      const tab = await browser.tabs.get(tabId);
      await handlePopup(tabId, tab.url);
    })().then(() => void 0).catch(console.info);
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    (async () => {
      const tab = await browser.tabs.get(tabId);
      await handlePopup(tabId, tab.url);
    })().then(() => void 0).catch(console.info);
  });
});
