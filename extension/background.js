console.log("background", new Date());

function handleClick(tab) {
  chrome.tabs.sendMessage(tab.id, { action: "get_data" }, function (response) {
    if (response) {
      fetchHtml(response.data, tab.id);
    } else {
      alert("empty response");
      console.log(response);
    }
  });
}
chrome.browserAction.onClicked.addListener(handleClick);

function fetchHtml(data, tabId) {
  chrome.tabs.sendMessage(tabId, {
    action: "return_data",
    data: { dan: data },
  });
}
