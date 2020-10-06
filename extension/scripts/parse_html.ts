type parsedTeamsType = {
  name: string;
  teamId: number;
  gameProgresses: (number | undefined)[];
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
      Array.from(i.getElementsByClassName("owner-name"))
        .map((i) => i.innerHTML)
        .join(","),
    ]);
  return Array.from(document.body.getElementsByClassName("team-header")).map(
    (teamHeader, index) => {
      var name = teamHeader
        .getElementsByClassName("teamName")[0]
        .getAttribute("title");
      var owners = Array.from(teamHeader.getElementsByClassName("owner-name"))
        .map((owner) => owner.innerHTML)
        .join(",");
      var teamId = parseInt(allTeams.find((team) => team[1] === owners)[0]);
      var gameProgresses = getGameProgresses(index);
      return { name, teamId, gameProgresses };
    }
  );
}

// todo
function getGameProgresses(index: number) {
  return [];
  // getElementsByClassName("game-status-inline")
}

function getText(element) {
  if (!element.children?.length) return element.innerText;
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
