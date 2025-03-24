export default defineBackground(() => {
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.url) {
      const url = new URL(changeInfo.url);
      if (!url.hostname.includes(".netsuite.com")) {
        await browser.action.disable(tabId);
        return;
      }
      await browser.action.enable(tabId);
      await browser.action.setPopup({ popup: "popup-ext.html" });
    }
  });
});
