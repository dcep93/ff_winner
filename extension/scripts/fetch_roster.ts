type playerType = {
  id: number;
  name: string;
  imgurl: string;
  position: string;
  fpts: number;
  gameProgress?: number;
};
type teamsType = { name: string; players: playerType[] }[];

function fetchRoster(params: parsedHTMLType): teamsType {
  console.log(arguments.callee.name, arguments[0]);
  return [];
}
