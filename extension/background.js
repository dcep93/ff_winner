console.log("background", new Date());

function handleClick(tab) {
  chrome.tabs.sendMessage(tab.id, {});
}
chrome.browserAction.onClicked.addListener(handleClick);

function fetchHtml(data, tabId) {
  chrome.tabs.sendMessage(tabId, {
    action: "return_data",
    data: { dan: data },
  });
}
