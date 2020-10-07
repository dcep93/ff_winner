type playerType = {
  id: number;
  name: string;
  imgurl: string;
  position: string;
  fpts: number;
  gameProgress?: number;
};
type teamsType = { name: string; players: playerType[] }[];

const headshotRegexp = /\/i\/headshots\/nfl\/players\/full\/(?<id>\d+)\.png/i;
function fetchRoster(params: parsedHTMLType): Promise<teamsType> {
  console.log(arguments.callee.name, arguments[0]);
  const apiUrl =
    "https://fantasy.espn.com/apis/v3/games/ffl/seasons/" +
    params.seasonId +
    "/segments/0/leagues/" +
    params.leagueId +
    "?view=mMatchup&view=mMatchupScore&scoringPeriodId=" +
    params.matchupPeriodId;
  const awayTeamId = params.teams[0].teamId;
  return fetch(apiUrl)
    .then((r) => r.json())
    .then((r) => r.schedule)
    .then((schedule) =>
      schedule.find(
        (i) =>
          i.matchupPeriodId === params.matchupPeriodId &&
          i.away.teamId === awayTeamId
      )
    )
    .then((apiGameObj) => [apiGameObj.away, apiGameObj.home])
    .then((apiGameArr) =>
      apiGameArr.map((apiTeam, i) => {
        const players = params.teams[i].players.map((parsedPlayer) => {
          const player = apiTeam.rosterForCurrentScoringPeriod.entries.find(
            (p) => p.playerPoolEntry.player.fullName === parsedPlayer.name
          );
          return {
            id: player.playerId,
            name: parsedPlayer.name,
            imgurl:
              player.playerId > 0
                ? "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/" +
                  player.playerId +
                  ".png&w=96&h=70&cb=1"
                : "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/" +
                  parsedPlayer.team +
                  ".png",
            position: slotCategoryIdToPositionMap[player.lineupSlotId],
            fpts: parsedPlayer.fpts,
            gameProgress: parsedPlayer.gameProgress,
          };
        });
        return { name: params.teams[i].name, players };
      })
    );
}
