import { handlePopup } from "@/utils/helpers";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    (async () => {
      const currentTab = await browser.tabs.query({ active: true, currentWindow: true });
      const tabActive = currentTab.find(tab => tab.active || null);
      const tabId = tabActive?.id;
      await handlePopup(tabId);
    })().then(() => void 0).catch(console.info);
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    (async () => {
      await handlePopup(tabId);
    })().then(() => void 0).catch(console.info);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    (async () => {
      if (changeInfo.status === "complete") await handlePopup(tabId);
    })().then(() => void 0).catch(console.info);
  });
});