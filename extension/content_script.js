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
    [
      "parse_html.ts",
      "fetch_roster.ts",
      "fetch_watson.ts",
      "construct_distributions.ts",
    ].map(fileToPromise)
  )
    // need to call functions like this so they are lazy loaded
    .then(() => parseHTML())
    .then((data) => fetchRoster(data))
    .then((data) => fetchWatson(data))
    .then((data) => constructDistributions(data))
    .then((data) => render(data))
    .catch(alert)
    .then(() => (document.title = title));
}

function fileToPromise(fileName) {
  const url = chrome.runtime.getURL(`scripts/${fileName}`);
  return fetch(url)
    .then((response) => response.text())
    .then((code) => window.ts.transpile(code))
    .then(eval);
}

function render(data) {
  document.title = "Rendering...";
  console.log(data);
  const url = chrome.runtime.getURL("manifest.json");
  fetch(url)
    .then((response) => response.json())
    .then((json) => json.version)
    .then((version) =>
      chrome.runtime.sendMessage({
        data: Object.assign(data, { version }),
        page: "popup/distribution.html",
      })
    );
}
