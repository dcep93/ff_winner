const key = "distribution_v0.1";

const num_points = 10000;
const num_lines = 3;

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

function render(distribution) {
  const p1 = cumProb(distribution[0]);
  const p2 = cumProb(distribution[1]);

  chooseInflectionPoints(p1, p2);

  const diff = cumProb(distribution[2]);

  plot("#teams", { green: p1, purple: p2 }, true);
  plot("#diff", { green: diff }, false);
}

function cumProb(d) {
  const low = d[0].v;
  const high = d[d.length - 1].v;
  const size = (high - low) / (num_points - 1);
  const map = {};
  d.forEach((i) => {
    var score = Math.floor((i.v - low) / size) * size + low;
    map[score] = i.p + (map[score] || 0);
  });
  var prob = 0;
  return Object.keys(map)
    .map((i) => [parseFloat(i), map[i]])
    .sort((a, b) => a[0] - b[0])
    .map((i) => {
      prob += i[1];
      return [i[0], prob];
    })
    .concat([[high, 0]]);
}

function chooseInflectionPoints(p1, p2) {}
