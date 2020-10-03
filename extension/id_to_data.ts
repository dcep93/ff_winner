type dataType = playerType & { d: dType; t: string };
type idsToDataType = dataType[][];

function idToData(ids: htmlToIdsType): Promise<idsToDataType> {
  console.log(arguments.callee.name);
  document.title = "Fetching Data...";
  const teamPromises = ids.map((teamIds) =>
    Promise.all(teamIds.filter((i) => i.id).map(playerToData))
  );
  return Promise.all(teamPromises);
}

function playerToData(player: playerType): Promise<dataType> {
  return fetch(
    `https://watsonfantasyfootball.espn.com/espnpartner/dallas/projections/projections_${player.id}_ESPNFantasyFootball_2020.json`
  )
    .then((r) => r.json())
    .then((r) => r[r.length - 1])
    .then((r) => ({
      t: r.DATA_TIMESTAMP,
      d:
        r.SCORE_DISTRIBUTION === "None" ? [] : JSON.parse(r.SCORE_DISTRIBUTION),
    }))
    .then((r) =>
      Object.assign({}, r, {
        d: r.d.map((x: number[]) => ({ v: x[0], p: x[1] })),
      })
    )
    .then((r) => Object.assign(r, player));
}
