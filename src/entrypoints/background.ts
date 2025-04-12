import { getCurrentTabId, handlePopup } from "@/utils/helpers";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    getCurrentTabId().then((tabId) => handlePopup(tabId)).then(() => void 0).catch(console.info);
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    handlePopup(tabId).then(() => void 0).catch(console.info);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status !== "complete") return;
    handlePopup(tabId).then(() => void 0).catch(console.info);
  });

  browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === browser.windows.WINDOW_ID_NONE) return;
    getCurrentTabId().then((tabId) => handlePopup(tabId)).then(() => void 0).catch(console.info);
  });
});
