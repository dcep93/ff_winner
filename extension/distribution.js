const key = "distribution_v0.1";

const num_points = 10;

const timeout = setTimeout(
  () => render(JSON.parse(localStorage.getItem(key))),
  100
);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  clearTimeout(timeout);
  localStorage.setItem(key, JSON.stringify(message));
  render(message);
  sendResponse(true);
});

function getPoints(d) {
  const low = d[0].v;
  const high = d[d.length - 1].v;
  const size = (high - low) / (num_points - 1);
  const map = {};
  d.forEach((i) => {
    var score = Math.floor((i.v - low) / size) * size + low;
    map[score] = i.p + (map[score] || 0);
  });
  return Object.keys(map).map((i) => [parseFloat(i), map[i]]);
}

function render(distribution) {
  console.log(distribution);
  const p1 = getPoints(distribution[0]);
  const p2 = getPoints(distribution[1]);
  const diff = getPoints(distribution[2]);
  console.log(p1);
  console.log(p1.map((i) => i[1]).reduce((a, b) => a + b, 0));
}
