function idToData(
  ids: { id: string; name: string }[][]
): Promise<{ id: string; name: string; distribution: number[][] }[][]> {
  const teamPromises = ids.map((teamIds) =>
    Promise.all(teamIds.map(playerToData))
  );
  return Promise.all(teamPromises);
}

function playerToData(player: {
  id: string;
  name: string;
}): Promise<{ id: string; name: string; distribution: number[][] }> {
  return fetch(
    `https://watsonfantasyfootball.espn.com/espnpartner/dallas/projections/projections_${player.id}_ESPNFantasyFootball_2020.json`
  )
    .then((r) => r.json())
    .then((r) => r[r.length - 1])
    .then((r) => JSON.parse(r.SCORE_DISTRIBUTION))
    .then((distribution) => Object.assign({ distribution }, player));
}
