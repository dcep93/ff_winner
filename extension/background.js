console.log("background", new Date());

chrome.browserAction.onClicked.addListener((tab) =>
  chrome.tabs.sendMessage(tab.id, {})
);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  chrome.tabs.create({ url: chrome.runtime.getURL(message.page) }, function (
    tab
  ) {
    sendMessage(tab.id, message.data, 10);
  });
});

function sendMessage(tabId, data, retries) {
  chrome.tabs.sendMessage(tabId, data, (response) => {
    if (response) return;
    chrome.runtime.lastError;
    if (!retries) return;
    setTimeout(() => sendMessage(tabId, data, retries - 1), 25);
  });
}
