export default defineBackground(() => {
  browser.action.onClicked.addListener((tab) => {
    if (!tab.url) return;
    const url = new URL(tab.url);
    if (!url.hostname.includes(".app.netsuite.com")) {
      browser.action.disable(tab.id);
      return;
    }
    browser.action.setPopup({ popup: "popup-ext.html" });
  });
});
