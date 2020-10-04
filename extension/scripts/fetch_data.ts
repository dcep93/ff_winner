type dataType = playerType & {
  d: dType;
  t: string;
  proj: number;
  mean: number;
  median: number;
  stddev: number;
};
type idsToDataType = { name: string; players: dataType[] }[];

function fetchData(teams: teamsType): Promise<idsToDataType> {
  console.log(arguments.callee.name, arguments[0]);
  document.title = "Fetching Data...";
  const teamPromises = teams.map(
    (teamIds) =>
      new Promise((resolve) =>
        Promise.all(teamIds.players.filter((i) => i.id).map(playerToData))
          .then((players) => Object.assign({}, teamIds, { players }))
          .then(resolve)
      )
  );
  return Promise.all((teamPromises as unknown) as idsToDataType);
}

function playerToData(player: playerType): Promise<dataType> {
  return (
    fetch(
      `https://watsonfantasyfootball.espn.com/espnpartner/dallas/projections/projections_${player.id}_ESPNFantasyFootball_2020.json`
    )
      .then((r) => r.json())
      .then((r) => r[r.length - 1])
      .then((r) => ({
        t: r.DATA_TIMESTAMP.split(" ")[0],
        proj: r.SCORE_PROJECTION,
        d:
          r.SCORE_DISTRIBUTION === "None"
            ? []
            : JSON.parse(r.SCORE_DISTRIBUTION),
      }))
      .then((r) => {
        const sum = r.d.map((i) => i[1]).reduce((a, b) => a + b, 0);
        return Object.assign({}, r, {
          d: r.d.map((x: number[]) => ({ v: x[0], p: x[1] / sum })),
        });
      })
      .then((r) =>
        Object.assign(
          {
            mean: r.d.map((i) => i.p * i.v).reduce((a, b) => a + b, 0),
            median: r.d.reduce(
              (a, b) => (a.p >= 0.5 ? a : { p: a.p + b.p, v: b.v }),
              { p: 0, v: 0 }
            ).v,
          },
          r,
          player
        )
      )
      // not 100% sure this is correct
      .then((r) =>
        Object.assign(
          {
            stddev: Math.pow(
              r.d
                .map((i) => Math.pow(i.v - r.mean, 2) * i.p)
                .reduce((a, b) => a + b, 0),
              0.5
            ),
          },
          r
        )
      )
  );
}
