type teamsAndDistsType = { dists: distType[]; teams: teamsStatsType };

const MAX_DIST_LENGTH = 150;
const MAX_PLAYERS = 9;
// draining a full bathtub with the tap on
const DST_BASE = 10;

function constructDistributions(teams: teamsStatsType): teamsAndDistsType {
  console.log(arguments.callee.name, arguments[0]);
  document.title = "Computing...";
  const dists = teams.map((i) => i.playerStats).map(joinAllDistributions);
  document.title = "Picking a Winner...";
  const advantageDist = joinDistributions(dists[0], dists[1], true);
  dists.push(advantageDist);
  return { dists, teams };
}

function joinAllDistributions(
  teamData: playerStatsType[],
  i: number
): distType {
  var d = [{ v: 0, p: 1 }];
  teamData.slice(0, MAX_PLAYERS).forEach((player, j) => {
    var progress = (i + j / MAX_PLAYERS) / 2;
    document.title = `Computing... ${(progress * 100).toFixed(0)}%`;
    if (player.gameProgress !== undefined) {
      // this is sus for d/st
      var base = player.id < 0 ? DST_BASE : 0;
      var projected = (player.fpts - base) / player.gameProgress + base;
      if (player.dist.length === 0) {
        d = d.map((point) =>
          Object.assign({}, point, { v: point.v + projected })
        );
      } else {
        var dampened = projected * (1 - player.gameProgress);
        var dist = player.dist.map((point) => ({
          p: point.p,
          v:
            player.fpts -
            player.gameProgress * dampened +
            (1 - player.gameProgress) * point.v * (1 - player.gameProgress),
        }));
        d = joinDistributions(d, dist);
      }
    } else if (player.fpts !== undefined) {
      d = d.map((point) =>
        Object.assign({}, point, { v: point.v + player.fpts })
      );
    } else if (player.dist.length > 0) {
      d = joinDistributions(d, player.dist);
    }
    delete player.dist;
  });
  return d;
}

function joinDistributions(
  d1: distType,
  d2: distType,
  forAdvantage?: boolean
): distType {
  const scoreToP = {};
  const operator = forAdvantage ? -1 : 1;
  d1.forEach((p1) =>
    d2.forEach((p2) => {
      const prob = p1.p * p2.p;
      const score = p1.v + p2.v * operator;
      if (prob > 0) {
        scoreToP[score] = prob + (scoreToP[score] || 0);
      }
    })
  );
  var d = Object.keys(scoreToP)
    .map((score) => parseFloat(score))
    .map((score) => ({ v: score, p: scoreToP[score] }))
    .sort((a, b) => a.v - b.v);
  if (d.length > MAX_DIST_LENGTH) {
    const size = Math.ceil(d.length / MAX_DIST_LENGTH);
    const newD = [];
    for (let lower = 0; lower < d.length; lower += size) {
      let upper = lower + size;
      let window = d.slice(lower, upper);
      let newPoint = window.reduce(
        (a, b) => {
          let p = a.p + b.p;
          let v = (a.p * a.v + b.p * b.v) / p;
          return { p, v };
        },
        { p: 0, v: 0 }
      );
      newD.push(newPoint);
    }
    d = newD;
  }
  return d;
}
