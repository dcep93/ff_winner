chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("receive", message);
  switch (message.action) {
    case "get_data":
      getData(sendResponse);
      break;
    case "return_data":
      returnData(message.data);
      break;
    default:
      console.log("no action");
      return false;
  }
  return true;
});

function getData(sendResponse) {
  sendResponse({ data: document.body.innerHTML });
}

function returnData(data) {
  alert("data returned");
  console.log(data);
}
