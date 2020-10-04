console.log("background", new Date());

function handleClick(tab) {
  chrome.tabs.sendMessage(tab.id, {});
}

chrome.browserAction.onClicked.addListener(handleClick);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  render(message.data);
});

function render(data) {
  chrome.tabs.create(
    { url: chrome.runtime.getURL("distribution.html") },
    function (tab) {
      sendMessage(tab.id, data, 10);
    }
  );
}

function sendMessage(tabId, data, retries) {
  chrome.tabs.sendMessage(tabId, data, (response) => {
    if (response) return;
    chrome.runtime.lastError;
    if (!retries) return;
    setTimeout(() => sendMessage(tabId, data, retries - 1), 25);
  });
}
