
(() => {
  console.log("LAC: Content script running...");
  chrome.storage.sync.set({buttonState: "start"});
})();

