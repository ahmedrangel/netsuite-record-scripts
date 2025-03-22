export default defineBackground(() => {
  browser.action.onClicked.addListener((tab) => {
    (async () => {
      if (!tab.url) return;
      const url = new URL(tab.url);
      if (!url.hostname.includes(".app.netsuite.com")) {
        await browser.action.disable(tab.id);
        return;
      }
      await browser.action.setPopup({ popup: "popup-ext.html" });
    })().catch(console.info);
  });
});