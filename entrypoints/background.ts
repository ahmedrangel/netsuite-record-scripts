export default defineBackground(() => {
  browser.action.onClicked.addListener((tab) => {
    browser.action.setPopup({ popup: "popup-ext.html" });
  });
});
