export default defineBackground(() => {
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    (async () => {
      if (changeInfo.url) {
        const url = new URL(changeInfo.url);
        if (!url.hostname.includes(".netsuite.com")) {
          await browser.action.disable(tabId);
          return;
        }
        await browser.action.enable(tabId);
        await browser.action.setPopup({ popup: "popup-ext.html" });
      }
    })().then(() => void 0).catch(console.info);
  });
});
