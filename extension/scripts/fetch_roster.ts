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

function fetchRoster(params: parsedHTMLType): teamsType {
  console.log(arguments.callee.name, arguments[0]);
  return [];
}

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
