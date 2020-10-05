function plot(tag, dataObj, upset) {
  // dimensions
  var availableWidth = document.body.offsetWidth / 2;
  var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = availableWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var svg = d3
    .select(tag)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // domain and range
  y.domain([0, 1]);
  svg.append("g").call(d3.axisLeft(y));
  svg
    .append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).ticks(20).tickSize(-width).tickFormat(""));

  const nestedEdgeIntercepts = Object.values(dataObj).map((data) => [
    findIntercept(0.02, 1, data),
    findIntercept(0.98, 1, data),
  ]);
  const domain = [
    Math.min(...nestedEdgeIntercepts.map((i) => i[0])),
    Math.max(...nestedEdgeIntercepts.map((i) => i[1])),
  ];
  x.domain(domain);
  svg
    .append("g")
    .attr("transform", `translate(${0},${height})`)
    .call(d3.axisBottom(x).tickFormat((d) => d));

  // function to handle input
  var lineSvg = svg.append("g");
  var valueline = d3
    .line()
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));
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

  if (upset !== null && !isNaN(upset)) {
    drawLine([upset, 1], "black");
  }

  // draw data and return actions on mouse move
  const mouseMoves = Object.keys(dataObj).map((color) => {
    // draw data
    let data = dataObj[color].filter(
      (i) => i[0] >= domain[0] && i[0] <= domain[1]
    );
    let low = data.length ? data[0][0] : domain[0];
    let high = data.length ? data[data.length - 1][0] : domain[1];
    lineSvg
      .append("path")
      .data([[[low, 0], ...data, [high, 0]]])
      .attr("class", "line")
      .attr("style", `stroke: black; fill: ${color}`)
      .attr("d", valueline);
    if (upset !== null) {
      const step = 1 / (1 + num_lines);
      for (let t = step; t < 1; t += step) {
        drawLine([findIntercept(t, 1, data), t], color);
      }
    } else {
      var intercept = findIntercept(0, 0, data);
      drawLine([0, intercept], "black");
      var action, prob;
      if (intercept === null) intercept = data[0][0] > 0 ? 0 : 1;
      if (intercept > 0.5) {
        action = "LOSES TO";
        prob = intercept;
      } else {
        action = "BEATS";
        prob = 1 - intercept;
      }
      document.getElementById("summary_action").innerText = action;
      document.getElementById("summary_prob").innerText = (prob * 100).toFixed(
        2
      );
    }

    // handle mouse move
    // TODO: mouseout to make label disappear
    var focus = svg.append("g").style("display", "none");

    focus
      .append("circle")
      .style("fill", "none")
      .style("stroke", "blue")
      .attr("r", 4);

    focus.append("text").attr("dx", "5px").attr("dy", "15px");

    // on mousemove, horizontal dimension of mouse position
    return function (horizontal) {
      var vertical = findIntercept(horizontal, 0, data);
      if (vertical !== null) {
        var point = [horizontal, vertical];
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

function findIntercept(value, pos, data) {
  var index = data.findIndex((i) => i[pos] >= value);
  var pointA = data[index - 1];
  var pointB = data[index];
  if (pointA && pointB) {
    var distA = value - pointA[pos];
    var distB = pointB[pos] - value;
    return distA === 0
      ? pointA[1]
      : (distA * pointB[1 - pos] + distB * pointA[1 - pos]) / (distA + distB);
  } else {
    return null;
  }
}
