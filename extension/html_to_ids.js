function htmlToIds() {
  return Array.from(document.body.getElementsByClassName("matchupTable"))
    .map((element) => element.getElementsByTagName("tbody")[0])
    .map(tableToIds);
}

var headshotRegexp = /\/i\/headshots\/nfl\/players\/full\/(?<id>\d+)\.png/i;
function tableToIds(tableElement) {
  var ids = [];
  for (var i = 0; i < tableElement.children.length; i++) {
    var tr = tableElement.children[i];
    if (tr.children[0].classList.contains("total-col")) {
      break;
    }
    var id = trToId(tr);
    if (id !== null) {
      ids.push(id);
    }
  }
  if (ids.length !== 9) {
    alert(`${ids.length} found`);
  }
  return ids;
}

var teamToId = {
  Bills: "-16002",
  Bears: "-16003",
  Falcons: "-16001",
  Bengals: "-16004",
  Browns: "-16005",
  Cowboys: "-16006",
  Broncos: "-16007",
  Lions: "-16008",
  Packers: "-16009",
  Titans: "-16010",
  Colts: "-16011",
  Chiefs: "-16012",
  Raiders: "-16013",
  Rams: "-16014",
  Dolphins: "-16015",
  Vikings: "-16016",
  Saints: "-16018",
  Patriots: "-16017",
  Giants: "-16019",
  Jets: "-16020",
  Eagles: "-16021",
  Cardinals: "-16022",
  Steelers: "-16023",
  Chargers: "-16024",
  "49ers": "-16025",
  Washington: "-16028",
  Jaguars: "-16030",
  Seahawks: "-16026",
  Panthers: "-16029",
  Buccaneers: "-16027",
  Ravens: "-16033",
  Texans: "-16034",
};

function trToId(tr) {
  var match = tr.innerHTML.match(headshotRegexp);
  if (match) {
    var groups = match.groups;
    if (groups) {
      return groups.id;
    }
  }
  var dst = tr.getElementsByClassName("truncate")[0];
  if (dst) {
    var teamMatch = dst.innerText.match(/(?<team>.*?) D\/ST/);
    if (teamMatch) {
      var groups = teamMatch.groups;
      if (groups) {
        var team = groups.team;
        var teamId = teamToId[team];
        if (teamId) {
          return teamId;
        }
      }
    }
    alert(teamMatch);
  }
  console.log(tr.innerHTML);
  return null;
}
