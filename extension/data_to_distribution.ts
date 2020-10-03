type dType = { v: number; p: number }[];
type dataToDistributionType = dType[];

function dataToDistribution(data: idsToDataType): dataToDistributionType {
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
  return [{ v: 1, p: 2 }];
}
