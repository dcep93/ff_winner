chrome.runtime.onMessage.addListener(execute);

function execute() {
  Promise.all(
    [
      "html_to_ids.ts",
      "id_to_data.ts",
      "data_to_distribution.ts",
      "render_distribution.ts",
    ].map(fileToPromise)
  )
    // need to call functions like this so they arent cached or something
    .then(() => htmlToIds())
    .then((ids) => idToData(ids))
    .then((data) => dataToDistribution(data))
    .then((distribution) => renderDistribution(distribution));
}

function fileToPromise(fileName) {
  const url = chrome.runtime.getURL(fileName);
  return fetch(url)
    .then((response) => response.text())
    .then((code) => window.ts.transpile(code))
    .then(eval);
}
