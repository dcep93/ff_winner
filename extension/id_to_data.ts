type dataType = playerType & { d: dType };
type idsToDataType = dataType[][];

function idToData(ids: htmlToIdsType): Promise<idsToDataType> {
  const teamPromises = ids.map((teamIds) =>
    Promise.all(teamIds.map(playerToData))
  );
  return Promise.all(teamPromises);
}

function playerToData(player: {
  id: string;
  name: string;
}): Promise<{
  id: string;
  name: string;
  d: dType;
}> {
  return fetch(
    `https://watsonfantasyfootball.espn.com/espnpartner/dallas/projections/projections_${player.id}_ESPNFantasyFootball_2020.json`
  )
    .then((r) => r.json())
    .then((r) => r[r.length - 1])
    .then((r) => JSON.parse(r.SCORE_DISTRIBUTION))
    .then((r) => r.map((x: number[]) => ({ v: x[0], p: x[1] })))
    .then((d) => Object.assign({ d }, player));
}
