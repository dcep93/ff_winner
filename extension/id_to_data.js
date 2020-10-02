function idToData(ids) {
  console.log("ids", ids);
  fetch(
    "https://watsonfantasyfootball.espn.com/espnpartner/dallas/projections/projections_-16033_ESPNFantasyFootball_2020.json"
  )
    .then((r) => r.json())
    .then((r) => r[r.length - 1])
    .then((r) => JSON.parse(r.SCORE_DISTRIBUTION))
    .then(console.log);
}
