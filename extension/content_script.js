chrome.runtime.onMessage.addListener(execute);

const log = console.log;
var title = document.title;

function execute() {
  if (location.pathname !== "/football/boxscore")
    return alert("Can only perform from boxscore view");

  const start = new Date();
  console.log = function () {
    var arr = Array.from(arguments);
    arr.unshift((new Date() - start) / 1000);
    log.apply(null, arr);
  };
  document.title = "Preparing...";
  Promise.all(
    ["html_to_ids.ts", "id_to_data.ts", "data_to_distribution.ts"].map(
      fileToPromise
    )
  )
    // need to call functions like this so they arent cached or something
    .then(() => htmlToIds())
    .then((ids) => idToData(ids))
    .then((data) => dataToDistribution(data))
    .then((data) => renderDistribution(data))
    .then(() => (document.title = title));
}

function fileToPromise(fileName) {
  const url = chrome.runtime.getURL(fileName);
  return fetch(url)
    .then((response) => response.text())
    .then((code) => window.ts.transpile(code))
    .then(eval);
}

function renderDistribution(data) {
  document.title = "Rendering...";
  console.log(data);
  chrome.runtime.sendMessage({ data });
}
