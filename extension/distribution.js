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

  plot("#teams", { green: p1, purple: p2 }, true);
  plot("#diff", { green: diff }, false);
}

function plot(tag, dataObj, divisions) {
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
    .attr("transform", `translate(${margin.left},${margin.top})`);

  y.domain([0, 1]);
  svg.append("g").call(d3.axisLeft(y));
  svg
    .append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).ticks(20).tickSize(-width).tickFormat(""));

  const xs = Object.values(dataObj)
    .flatMap((i) => i)
    .map((i) => i[0]);
  const domain = [Math.min(...xs), Math.max(...xs)];
  x.domain(domain);
  svg
    .append("g")
    .attr("transform", `translate(${0},${height})`)
    .call(d3.axisBottom(x).tickFormat((d) => d));

  var lineSvg = svg.append("g");
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

  const mouseMoves = Object.keys(dataObj).map((color) => {
    let data = dataObj[color];
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

    var focus = svg.append("g"); //.style("display", "none");

    focus
      .append("circle")
      .style("fill", "none")
      .style("stroke", "blue")
      .attr("r", 4);

    focus.append("text").attr("dx", "5px").attr("dy", "15px");

    return function (horizontal) {
      var point = data.find((i) => i[0] >= horizontal);
      if (point) {
        focus.style("display", null);
        var translate = `translate(${x(point[0])},${y(point[1])})`;
        focus.select("circle").attr("transform", translate);
        focus
          .select("text")
          .attr("transform", translate)
          .text(`${point[0].toFixed(1)} , ${point[1].toFixed(3)}`);
      } else {
        focus.style("display", "none");
      }
    };
  });

  function mouseMove() {
    var horizontal = x.invert(d3.pointer(event, this)[0]);
    mouseMoves.forEach((i) => i(horizontal));
  }

  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", mouseMove);
}
