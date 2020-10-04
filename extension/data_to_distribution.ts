type dType = { v: number; p: number }[];
type dataToDistributionType = { ds: dType[]; players: idsToDataType };

const MAX_LENGTH = 150;
const MAX_PLAYERS = 9;

function dataToDistribution(players: idsToDataType): dataToDistributionType {
  console.log(arguments.callee.name);
  document.title = "Computing...";
  const ds = players.map(joinAllDistributions);
  document.title = "Picking a Winner...";
  const advantage = joinDistributions(ds[0], ds[1], true);
  ds.push(advantage);
  return { ds, players };
}

function joinAllDistributions(teamData: dataType[], i: number): dType {
  var d = [{ v: 0, p: 1 }];
  teamData.slice(0, MAX_PLAYERS).forEach((di, j) => {
    var progress = (i + j / MAX_PLAYERS) / 2;
    document.title = `Computing... ${(progress * 100).toFixed(0)}%`;
    if (di.fpts !== undefined) {
      // NB: assumes zero additional points during active games
      d = d.map((point) => Object.assign({}, point, { v: point.v + di.fpts }));
    } else {
      d = joinDistributions(d, di.d);
    }
  });
  return d;
}

function joinDistributions(
  d1: dType,
  d2: dType,
  forAdvantage?: boolean
): dType {
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
  if (d.length > MAX_LENGTH) {
    const size = Math.ceil(d.length / MAX_LENGTH);
    const newD = [];
    for (let i = 0; true; i++) {
      let lower = i * size;
      let upper = lower + size;
      let window = d.slice(lower, upper);
      if (window.length === 0) break;
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
