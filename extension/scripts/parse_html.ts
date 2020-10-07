type parsedPlayerType = {
  gameProgress: number | undefined;
  fpts: number | undefined;
  name: string;
  team: string;
  position: string;
};
type parsedTeamsType = {
  name: string;
  teamId: number;
  players: parsedPlayerType[];
};
type parsedHTMLType = {
  matchupPeriodId: number;
  seasonId: number;
  leagueId: number;
  teams: parsedTeamsType[];
};

function parseHTML(): parsedHTMLType {
  console.log(arguments.callee.name, arguments[0]);
  document.title = "Parsing...";
  const urlParams = new URLSearchParams(window.location.search);
  const matchupPeriodId = parseInt(urlParams.get("matchupPeriodId"));
  const seasonId = parseInt(urlParams.get("seasonId"));
  const leagueId = parseInt(urlParams.get("leagueId"));
  const teams = getTeams();
  return { matchupPeriodId, seasonId, leagueId, teams };
}

function getTeams(): parsedTeamsType[] {
  const allTeams = Array.from(document.body.getElementsByTagName("a"))
    .filter((i) => i.href.match(/teamId=\d+$/))
    .map((i) => [
      i.href.split("&teamId=")[1],
      // annoying that we need to key by owner name
      Array.from(i.getElementsByClassName("owner-name"))
        .map((i) => i.innerHTML)
        .join(","),
    ]);
  return Array.from(document.body.getElementsByClassName("boxscore")).map(
    (teamHeader, index) => {
      var name = teamHeader
        .getElementsByClassName("teamName")[0]
        .getAttribute("title");
      var owners = Array.from(teamHeader.getElementsByClassName("owner-name"))
        .map((owner) => owner.innerHTML)
        .join(",");
      const found = allTeams.find((team) => team[1] === owners);
      var teamId: number;
      if (found) {
        teamId = parseInt(found[0]);
      } else {
        // first is my team
        teamId = parseInt(allTeams[0][0]);
      }
      var players = getPlayers(index);
      return { name, teamId, players };
    }
  );
}

function getPlayers(index: number): parsedPlayerType[] {
  const matchupTable = document.getElementsByClassName("matchupTable")[index];
  if (matchupTable) {
    return getFuturePlayers(matchupTable);
  } else {
    return getLivePlayers(index);
  }
}

function getLivePlayers(index: number): parsedPlayerType[] {
  return [];
}

function getFuturePlayers(matchupTable: Element): parsedPlayerType[] {
  return Array.from(
    matchupTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr")
  )
    .filter((tr) => tr.getElementsByClassName("total-col").length === 0)
    .filter(
      (tr) =>
        tr.getElementsByClassName("player-column__empty-headshot").length === 0
    )
    .map(parseFuturePlayer);
}

function parseFuturePlayer(tr: Element): parsedPlayerType {
  const maybeGameStatus = tr.getElementsByClassName("game-status-inline")[0];
  var gameProgress;
  if (maybeGameStatus) {
    const text = getText(maybeGameStatus);
    const match = text.match(/\d+-\d+,? (?<timing>.*)$/);
    gameProgress =
      match && match.groups ? getGameProgress(match.groups.timing) : undefined;
  } else {
    gameProgress = undefined;
  }
  const name = tr
    .getElementsByClassName("player-column__athlete")[0]
    .getAttribute("title");
  const position = getText(tr.children[0]);
  const fptsRaw = tr.children[5].children[0].children[0].innerHTML;
  const fpts = fptsRaw === "--" ? undefined : parseFloat(fptsRaw);
  const team = tr.getElementsByClassName("playerinfo__playerteam")[0].innerHTML;
  return { gameProgress, position, fpts, name, team };
}

function getText(element: Element) {
  if (!element.children?.length) return element.innerHTML;
  return Array.from(element.children).map(getText).join(" ");
}

function getGameProgress(timing: string): number {
  if (timing === "Half") return 0.5;
  const [clock, quarter] = timing.split(" ");
  var quarterPortion = quarterToPortion[quarter];
  if (clock === "End") return quarterPortion;
  const [minutes, seconds] = clock.split(":");
  var clockPortion = (parseInt(minutes) * 60 + parseInt(seconds)) / 3600;
  return quarterPortion - clockPortion;
}

const quarterToPortion = {
  "1st": 0.25,
  "2nd": 0.5,
  "3rd": 0.75,
  "4th": 1,
};
