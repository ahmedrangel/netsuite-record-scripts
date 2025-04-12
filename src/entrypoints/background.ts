import { getCurrentTabId, handlePopup } from "@/utils/helpers";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    (async () => {
      const tabId = await getCurrentTabId();
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

  browser.windows.onFocusChanged.addListener((windowId) => {
    (async () => {
      if (windowId === browser.windows.WINDOW_ID_NONE) return;
      const tabId = await getCurrentTabId();
      await handlePopup(tabId);
    })().then(() => void 0).catch(console.info);
  });
});
