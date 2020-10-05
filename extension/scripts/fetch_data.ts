type distType = { v: number; p: number }[];
type playerStatsType = playerType & {
  dist: distType;
  time: string;
  proj: number;
  mean: number;
  median: number;
  stddev: number;
};
type teamStatsType = { name: string; playerStats: playerStatsType[] };
type teamsStatsType = teamStatsType[];

function fetchData(teams: teamsType): Promise<teamsStatsType> {
  console.log(arguments.callee.name, arguments[0]);
  document.title = "Fetching Data...";
  const teamPromises = teams.map((team) =>
    Promise.all(
      team.players.filter((i) => i.id).map(playerToData)
    ).then((playerStats) => ({ name: team.name, playerStats }))
  );
  return Promise.all(teamPromises);
}

const url_prefix =
  "https://watsonfantasyfootball.espn.com/espnpartner/dallas/projections/projections";
const url_suffix = "ESPNFantasyFootball_2020.json";
function playerToData(player: playerType): Promise<playerStatsType> {
  return (
    fetch(`${url_prefix}_${player.id}_${url_suffix}`)
      .then((req) => req.json())
      .then((all_data) => all_data[all_data.length - 1])
      .then((data) => ({
        time: data.DATA_TIMESTAMP.split(" ")[0],
        proj: data.SCORE_PROJECTION,
        dist:
          data.SCORE_DISTRIBUTION === "None"
            ? []
            : JSON.parse(data.SCORE_DISTRIBUTION),
      }))
      .then((playerStats) => {
        const sum = playerStats.dist
          .map((i) => i[1])
          .reduce((a, b) => a + b, 0);
        return Object.assign({}, playerStats, {
          dist: playerStats.dist.map((x: number[]) => ({
            v: x[0],
            p: x[1] / sum,
          })),
        });
      })
      .then((playerStats) => Object.assign(playerStats, player))
      .then((playerStats) =>
        Object.assign(playerStats, {
          mean: playerStats.dist
            .map((i) => i.p * i.v)
            .reduce((a, b) => a + b, 0),
        })
      )
      // increase variance by doubling distance from mean
      .then((playerStats) =>
        Object.assign(playerStats, {
          dist: playerStats.dist.map((i) => ({
            p: i.p,
            v: 2 * i.v - playerStats.mean,
          })),
        })
      )
      .then((playerStats) =>
        Object.assign(playerStats, {
          median: playerStats.dist.reduce(
            (a, b) => (a.p >= 0.5 ? a : { p: a.p + b.p, v: b.v }),
            { p: 0, v: 0 }
          ).v,
        })
      )
      // not 100% sure this calculation of stddev is correct
      .then((playerStats) =>
        Object.assign(
          {
            stddev: Math.pow(
              playerStats.dist
                .map((i) => Math.pow(i.v - playerStats.mean, 2) * i.p)
                .reduce((a, b) => a + b, 0),
              0.5
            ),
          },
          playerStats
        )
      )
  );
}
