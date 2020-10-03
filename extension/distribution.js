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

  const threshold = chooseInflectionPoint(p1, p2);

  const diff = cumProb(distribution[2]);

  plot("#teams", { green: p1, purple: p2 }, threshold);
  plot("#diff", { green: diff }, null);
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
  return (
    Object.keys(map)
      .map((i) => [parseFloat(i), map[i]])
      .sort((a, b) => a[0] - b[0])
      .map((i) => {
        prob += i[1];
        return [i[0], prob];
      })
      // prevents weird shading
      .concat([[high, 0]])
  );
}

// this method is sus
function chooseInflectionPoint(p1, p2) {
  p1 = p1.slice();
  p2 = p2.slice();
  var probs = [];
  var x1 = p1.shift();
  var x2 = p2.shift();
  while (x1[1] && x2[1]) {
    if (x1[0] < x2[0]) {
      probs.push([x1[0], x1[1], x2[1]]);
      x1 = p1.shift();
    } else {
      probs.push([x2[0], x1[1], x2[1]]);
      x2 = p2.shift();
    }
  }
  var i1 = probs
    .map((i) => [i[0], i[2] * (1 - i[1])])
    .filter((i) => i[1])
    .reduce((a, b) => (a[1] > b[1] ? a : b), [0, 0]);
  var i2 = probs
    .map((i) => [i[0], i[1] * (1 - i[2])])
    .reduce((a, b) => (a[1] > b[1] ? a : b), [0, 0]);
  return (i1[0] + i2[0]) / 2;
}
