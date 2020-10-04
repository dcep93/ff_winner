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
  var table = document.getElementById("table");
  table.insertRow(-1).insertCell(-1).innerText = team.name;
  team.playerStats.forEach((player) => {
    var row = table.insertRow(-1);
    var playerDiv = document.createElement("div");
    var img = document.createElement("img");
    img.src = player.imgurl;
    img.height = "35";
    playerDiv.appendChild(img);
    var nameSpan = document.createElement("span");
    nameSpan.className = "right";
    nameSpan.innerText = `${player.name} (${player.position})`;
    playerDiv.appendChild(nameSpan);
    row.insertCell(-1).appendChild(playerDiv);
    ["fpts", "proj", "mean", "median", "stddev"].forEach(
      (attr) => (row.insertCell(-1).innerText = player[attr]?.toFixed(1) || "-")
    );
    row.insertCell(-1).innerText = player.time;
  });
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

function findUpset(t1, t2) {
  var t1IsWinning = findIntercept(0.5, 1, t1) > findIntercept(0.5, 1, t2);
  var favorite = t1IsWinning ? t1.slice() : t2.slice();
  var underdog = t1IsWinning ? t2.slice() : t1.slice();
  var upset = NaN;
  var prob = 0;
  var upsetQ;
  var probQ;
  var f = favorite.shift();
  var u = underdog.shift();
  while (f[1] && u[1]) {
    probQ = (1 - u[1]) * f[1];
    if (f[0] < u[0]) {
      upsetQ = f[0];
      f = favorite.shift();
    } else {
      upsetQ = u[0];
      u = underdog.shift();
    }
    if (probQ > prob) {
      prob = probQ;
      upset = upsetQ;
    }
  }
  return upset;
}
