const key = "distribution_v0.1";

const num_points = 1000;
const num_lines = 3;

const timeout = setTimeout(
  () => render(JSON.parse(localStorage.getItem(key))),
  100
);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  clearTimeout(timeout);
  localStorage.setItem(key, JSON.stringify(message));
  render(message);
  sendResponse(true);
});

function getPoints(d) {
  const low = d[0].v;
  const high = d[d.length - 1].v;
  const size = (high - low) / (num_points - 1);
  const map = {};
  d.forEach((i) => {
    var score = Math.floor((i.v - low) / size) * size + low;
    map[score] = i.p + (map[score] || 0);
  });
  var cumProb = 0;
  return Object.keys(map)
    .map((i) => [parseFloat(i), map[i]])
    .sort((a, b) => a[0] - b[0])
    .map((i) => {
      cumProb += i[1];
      return [i[0], cumProb];
    })
    .concat([[high, 0]]);
}

function render(distribution) {
  const p1 = getPoints(distribution[0]);
  const p2 = getPoints(distribution[1]);
  const diff = getPoints(distribution[2]);

  const teamsGraph = newGraph("#teams");
  const xs = p1.concat(p2).map((i) => i[0]);
  teamsGraph.domain([Math.min(...xs), Math.max(...xs)]);
  teamsGraph.plot(p1, "green", true);
  teamsGraph.plot(p2, "purple", true);

  const diffGraph = newGraph("#diff");
  diffGraph.domain([diff[0][0], diff[diff.length - 1][0]]);
  diffGraph.plot(diff, "green", false);
}

function newGraph(tag) {
  var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var valueline = d3
    .line()
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  var svg = d3
    .select(tag)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var lineSvg = svg.append("g");

  y.domain([0, 1]);

  const xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + height + ")");

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).ticks(20).tickSize(-width).tickFormat(""));

  var focus = svg.append("g").style("display", "none");

  focus
    .append("circle")
    .style("fill", "none")
    .style("stroke", "blue")
    .attr("r", 4);

  focus.append("text").attr("dx", "5px").attr("dy", "-5px");

  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => focus.style("display", null))
    .on("mouseout", () => focus.style("display", "none"))
    .on("mousemove", mousemove);

  function mousemove() {
    var horizontal = x.invert(d3.pointer(event, this)[0]);
    var vertical = 0.5;
    var translate = `translate(${x(horizontal)},${y(vertical)})`;
    focus.select("circle").attr("transform", translate);
    focus.select("text").attr("transform", translate).text(vertical);
  }

  const drawLine = ([x, y], color) =>
    lineSvg
      .append("path")
      .data([
        [
          [x, 0],
          [x, y],
        ],
      ])
      .attr("class", "line")
      .attr("style", `stroke: ${color}`)
      .attr("d", valueline);

  const plot = (data, color, divisions) => {
    lineSvg
      .append("path")
      .data([data])
      .attr("class", "line")
      .attr("style", `stroke: black; fill: ${color}`)
      .attr("d", valueline);
    if (divisions) {
      const step = 1 / (1 + num_lines);
      for (let t = step; t < 1; t += step) {
        drawLine(
          data.find((i) => i[1] >= t),
          color
        );
      }
    } else {
      drawLine(
        data.find((i) => i[0] > 0),
        "black"
      );
    }
  };

  const domain = (domain) => {
    x.domain(domain);
    xAxis.call(d3.axisBottom(x).tickFormat((d) => d));
  };

  return { plot, domain };
}
