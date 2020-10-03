console.log("background", new Date());

function handleClick(tab) {
  chrome.tabs.sendMessage(tab.id, {});
}

chrome.browserAction.onClicked.addListener(handleClick);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  render(message.distribution);
});

function render(distribution) {
  chrome.tabs.create(
    { url: chrome.runtime.getURL("distribution.html") },
    function (tab) {
      sendMessage(tab.id, distribution, 10);
    }
  );
}

function sendMessage(tabId, distribution, retries) {
  chrome.tabs.sendMessage(tabId, distribution, (response) => {
    if (response) return;
    chrome.runtime.lastError;
    if (!retries) return;
    setTimeout(() => sendMessage(tabId, distribution, retries - 1), 25);
  });
}
