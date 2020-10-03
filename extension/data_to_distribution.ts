type dType = { v: number; p: number }[];
type dataToDistributionType = dType[];

const MAX_LENGTH = 100;

function dataToDistribution(data: idsToDataType): dataToDistributionType {
  console.log(arguments.callee.name);
  const ds = data.map(joinAllDistributions);
  const advantage = joinDistributions(ds[0], ds[1], true);
  ds.push(advantage);
  return ds;
}

function joinAllDistributions(teamData: dataType[]): dType {
  var d = [{ v: 0, p: 1 }];
  teamData.forEach((di) => {
    const num = di.d.map((i) => i.p * i.v).reduce((a, b) => a + b, 0);
    const den = di.d.map((i) => i.p).reduce((a, b) => a + b, 0);
    const mean = num / den;
    console.log(di.id, di.name, mean.toFixed(3), di.fpts);
    if (di.fpts !== undefined) {
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
      if (scoreToP[score]) {
        scoreToP[score] += prob;
      } else {
        scoreToP[score] = prob;
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
