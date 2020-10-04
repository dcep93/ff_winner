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

//

function render(data) {
  console.log(data);
  renderTeams(data.teams);
  renderDistribution(data.dists);
}

function renderTeams(teams) {
  renderTeam(teams[0], "t1");
  renderTeam(teams[1], "t2");
}

function renderTeam(team, label) {
  document.getElementById(`summary_${label}`).innerText = team.name;
}

function renderDistribution(dists) {
  const t1 = cumProb(dists[0]);
  const t2 = cumProb(dists[1]);

  const upset = findUpset(t1, t2);
  document.getElementById("summary_upset").innerText = upset.toFixed(2);

  const diff = cumProb(dists[2]);

  plot("#teams", { green: t1, purple: t2 }, upset);
  plot("#diff", { green: diff }, null);
}

function cumProb(dist) {
  const low = dist[0].v;
  const high = dist[dist.length - 1].v;
  const size = (high - low) / (num_points - 1);
  const scoreMap = {};
  dist.forEach((i) => {
    var score = Math.floor((i.v - low) / size) * size + low;
    scoreMap[score] = i.p + (scoreMap[score] || 0);
  });
  var prob = 0;
  return (
    Object.keys(scoreMap)
      .map((i) => [parseFloat(i), scoreMap[i]])
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
function findUpset(t1, t2) {
  t1 = t1.slice();
  t2 = t2.slice();
  var probs = [];
  var p1 = t1.shift();
  var p2 = t2.shift();
  while (p1[1] && p2[1]) {
    if (p1[0] < p2[0]) {
      probs.push([p1[0], p1[1], p2[1]]);
      p1 = t1.shift();
    } else {
      probs.push([p2[0], p1[1], p2[1]]);
      p2 = t2.shift();
    }
  }
  var i1 = teamIdeal(probs, 1);
  var i2 = teamIdeal(probs, 2);
  return (i1[0] + i2[0]) / 2;
}

function teamIdeal(probs, index) {
  return probs
    .map((i) => [i[0], i[3 - index] * (1 - i[index])])
    .filter((i) => i[1])
    .reduce((a, b) => (a[1] > b[1] ? a : b), [0, 0]);
}
