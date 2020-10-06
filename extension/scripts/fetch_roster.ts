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
        const players = apiTeam.rosterForCurrentScoringPeriod.entries
          .map((player) => {
            const parsedPlayerIndex = params.teams[i].players.findIndex(
              (pp) => pp.name === player.playerPoolEntry.player.fullName
            );
            const parsedPlayer = params.teams[i].players[parsedPlayerIndex];
            return {
              id: player.playerId,
              name: parsedPlayer.name,
              imgurl:
                player.playerId > 0
                  ? "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/" +
                    player.playerId +
                    ".png&w=96&h=70&cb=1"
                  : "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/" +
                    dstIdToName[player.playerId] +
                    ".png&h=150&w=150&w=96&h=70&cb=1",
              position: slotCategoryIdToPositionMap[player.lineupSlotId],
              fpts: parsedPlayer.fpts,
              gameProgress: parsedPlayer.gameProgress,
              index: parsedPlayerIndex,
            };
          })
          .map((player) => [player.index, player])
          .sort()
          .map((arr) => arr[1]);
        return { name: params.teams[i].name, players };
      })
    );
}

// todo
const dstIdToName = {};

const dstToId = {
  Bills: -16002,
  Bears: -16003,
  Falcons: -16001,
  Bengals: -16004,
  Browns: -16005,
  Cowboys: -16006,
  Broncos: -16007,
  Lions: -16008,
  Packers: -16009,
  Titans: -16010,
  Colts: -16011,
  Chiefs: -16012,
  Raiders: -16013,
  Rams: -16014,
  Dolphins: -16015,
  Vikings: -16016,
  Saints: -16018,
  Patriots: -16017,
  Giants: -16019,
  Jets: -16020,
  Eagles: -16021,
  Cardinals: -16022,
  Steelers: -16023,
  Chargers: -16024,
  "49ers": -16025,
  Washington: -16028,
  Jaguars: -16030,
  Seahawks: -16026,
  Panthers: -16029,
  Buccaneers: -16027,
  Ravens: -16033,
  Texans: -16034,
};

const slotCategoryIdToPositionMap = {
  0: "QB",
  1: "TQB",
  2: "RB",
  3: "RB/WR",
  4: "WR",
  5: "WR/TE",
  6: "TE",
  7: "OP",
  8: "DT",
  9: "DE",
  10: "LB",
  11: "DL",
  12: "CB",
  13: "S",
  14: "DB",
  15: "DP",
  16: "D/ST",
  17: "K",
  18: "P",
  19: "HC",
  20: "Bench",
  21: "IR",
  22: "Unknown22", // TODO: Figure out what this is
  23: "RB/WR/TE",
  24: "Unknown24", // TODO: Figure out what this is
};
