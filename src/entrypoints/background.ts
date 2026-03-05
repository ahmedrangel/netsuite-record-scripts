import { getCurrentTabId, handlePopup } from "@/utils/helpers";

export default defineBackground(() => {
  browser.action.setPopup({ popup: "popup-ext.html" }).catch(() => console.info);

  browser.runtime.onInstalled.addListener(() => {
    getCurrentTabId().then((tabId) => handlePopup(tabId)).catch(console.info);
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    handlePopup(tabId).catch(console.info);
  });

  browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if (changeInfo.status === "complete" && tabInfo.active) {
      handlePopup(tabId).catch(console.info);
    }
  });

  browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === browser.windows.WINDOW_ID_NONE) return;
    getCurrentTabId().then((tabId) => handlePopup(tabId)).catch(console.info);
  });
});
