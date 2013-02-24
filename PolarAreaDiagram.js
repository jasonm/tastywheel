var timeseries, sdat, series, minVal = 1.4, maxVal = 6, radius, radiusLength;
var w = 600, h = 600, time = 10, ruleColor = '#CCC';
var innerRadiusIncrement = 10;
var vizPadding = {
  top: 25,
  right: 25,
  bottom: 25,
  left: 25
};
var numticks = maxVal / 0.5;
var viz, vizBody, maxs
var keys = ["x", "y", "z", "w", "u", "t", "a", "b"];
// var keys = ["x", "y"];
var axis = keys.length;

var loadViz = function(){
  loadData();
  buildBase();
  setScales();
  drawBars(0);
  addLineAxes();
  // addCircleAxes();
};

var loadData = function(){
  var randomFromTo = function randomFromTo(from, to){
    return Math.random() * (to - from) + from;
  };

  timeseries = [];
  sdat = [];

  for (j = 0; j < time; j++) {
    series = [[]];
    for (i = 0; i < axis; i++) {
      series[0][i] = randomFromTo(minVal,maxVal);
    }
    // This fills in the line 
    /*        for (i = 0; i < series.length; i += 1) {
              series[i].push(series[i][0]);
              }
              */        
    for (i=0; i<=numticks; i++) {
      sdat[i] = (maxVal/numticks) * i;
    }

    timeseries[j] = series;
  }
};

var buildBase = function(){
  viz = d3.select("#radial")
    .append('svg:svg')
    .attr('width', w)
    .attr('height', h);

  viz.append("svg:rect")
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', 0)
    .attr('width', 0)
    .attr('height', 0);

  vizBody = viz.append("svg:g")
    .attr('id', 'body');
};

var centerXPos, centerYPos;
setScales = function () {
  var heightCircleConstraint,
      widthCircleConstraint,
      circleConstraint;

  //need a circle so find constraining dimension
  heightCircleConstraint = h - vizPadding.top - vizPadding.bottom;
  widthCircleConstraint = w - vizPadding.left - vizPadding.right;
  circleConstraint = d3.min([heightCircleConstraint, widthCircleConstraint]);

  radius = d3.scale.linear().domain([0, maxVal])
    .range([0, (circleConstraint / 2)]);
  radiusLength = radius(maxVal);

  //attach everything to the group that is centered around middle
  centerXPos = (widthCircleConstraint / 2) + vizPadding.left;
  centerYPos = (heightCircleConstraint / 2) + vizPadding.top;

  vizBody.attr("transform", "translate(" + centerXPos + ", " + centerYPos + ")");
};

addCircleAxes = function() {
  var radialTicks = radius.ticks(numticks), circleAxes, i;

  vizBody.selectAll('.circle-ticks').remove();

  circleAxes = vizBody.selectAll('.circle-ticks')
    .data(sdat)
    .enter().append('svg:g')
    .attr("class", "circle-ticks");

  circleAxes.append("svg:circle")
    .attr("r", function (d, i) { return radius(d); })
    .attr("class", "circle")
    .style("stroke", ruleColor)
    .style("opacity", 0.7)
    .style("fill", "none");

  circleAxes.append("svg:text")
    .attr("text-anchor", "left")
    .attr("dy", function (d) { return -1 * radius(d); })
    .text(String);
}

addLineAxes = function () {
  var radialTicks = radius.ticks(numticks), lineAxes;

  vizBody.selectAll('.line-ticks').remove();

  lineAxes = vizBody.selectAll('.line-ticks')
    .data(keys)
    .enter().append('svg:g')
    .attr("transform", function (d, i) {
      return "rotate(" + ((i / axis * 360) - 90) +
      ")translate(" + radius(maxVal) + ")";
    })
  .attr("class", "line-ticks");

  lineAxes.append('svg:line')
    .attr("x2", -1 * radius(maxVal))
    .style("stroke", ruleColor)
    .style("opacity", 0.75)
    .style("fill", "none");

  // lineAxes.append('svg:text')
  //   .text(function(d,i){ return keys[i]; })
  //   .attr("text-anchor", "middle")
  //        .attr("transform", function (d, i) {
  //            return (i / axis * 360) < 180 ? null : "rotate(90)";
  //        });
};

// var draw = function (val) {
//   var groups,
//       lines,
//       linesToUpdate;
// 
//   groups = vizBody.selectAll('.series')
//     .data(timeseries[val]);
//   groups.enter().append("svg:g")
//     .attr('class', 'series')
//     .style('fill', "blue")
//     .style('stroke', "blue");
// 
//   groups.exit().remove();
// 
//   lines = groups.append('svg:path')
//     .attr("class", "line")
//     .attr("id", "userdata")
//     .attr("d", d3.svg.area.radial()
//         .radius(function (d) { return 0; })
//         .angle(function (d, i) { return (i / axis) * 2 * Math.PI; }))
//     .style("stroke-width", 3)
//     .style("fill", "red")
//     .style("opacity", 0.4);
// 
//   lines.attr("d", d3.svg.area.radial()
//       .outerRadius(function (d) { return radius(d); })
//       .innerRadius(function(d) { return 0; })
//       .angle(function (d, i) { return (i / axis) * 2 * Math.PI; }));
// };


var drawBars = function(val) {

  window.handleX = function(d, i) {
    var midAngle =
      ((d.startAngle + d.endAngle) * 0.5)
      -  (Math.PI / 2.0); // D3 seems to operate on a different quadrant basis?

    var handleRadius = radius(d.data);
    return handleRadius * Math.cos(midAngle);
  };

  window.handleY = function(d, i) {
    var midAngle =
      ((d.startAngle + d.endAngle) * 0.5)
      -  (Math.PI / 2.0); // D3 seems to operate on a different quadrant basis?
    var handleRadius = radius(d.data);
    return handleRadius * Math.sin(midAngle);
  };


  var drag = d3.behavior.drag()
    .on("dragstart", function(d, i) {
      var slice = d3.select(vizBody.selectAll(".series g.slice path")[0][i]);
      slice.attr("fill-opacity", 0.4);
      d3.select(this).style("fill-opacity", 0.6);
    })
    .on("dragend", function(d, i) {
      var slice = d3.select(vizBody.selectAll(".series g.slice path")[0][i]);
      slice.attr("fill-opacity", 0.6);
      d3.select(this).style("fill-opacity", 1.0);
    })
    .on("drag", function(d,i) {

      var x = d3.event.x;
      var y = d3.event.y;

      var newMagnitude = Math.sqrt(x * x + y * y);
      var newValue = radius.invert(newMagnitude);

      if (newValue < minVal) { newValue = minVal; }
      if (newValue > maxVal) { newValue = maxVal; }

      updateData(val, i, newValue);

      // redraw(0);
    });

  window.pie = undefined;
  pie = d3.layout.pie().value(function(d) { return 1; }).sort(null);

  ones = [];
  for(i = 0; i<timeseries[val][0].length; i++) { ones.push(1); }
  // d = [1,2,3,5,8,11,19,30]; // different pie slice widths

  var data = timeseries[val][0];

  window.groups = vizBody.selectAll('.series')
    .data([ones]);
  groups.enter().append("svg:g")
    .attr('class', 'series')
    .style('fill', "blue")
    .style('stroke', "black");

  groups.exit().remove();

  var color = d3.scale.category10();

  window.bar = d3.svg.arc()
    .innerRadius( innerRadiusIncrement * w / 100.0 )
    .outerRadius( function(d,i) { 
      return radius( d.data );
    });

  window.arcs = groups.selectAll(".series g.arc")
    .data(pie(data));

  arc = arcs
    .enter()
    .append("g")
      .attr("class", "slice")
    .append("path")
      .attr("fill", function(d,i) { return color(i); })
      .attr("d", window.bar)
      .style("opacity", 0.6);

  var width = 10;
  var height = 10;
  var handleRad = 10;

  var handles = groups.selectAll(".series g.handle")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "handle");

  handles.append("circle")
    .call(drag)
    .attr("fill", "#ddd")
    .attr("stroke", "#666")
    .attr("stroke-width", "3")
    .attr("cx", handleX)
    .attr("cy", handleY)
    .attr("r", handleRad);
}

function updateData(val, i, newValue) {
  var data = timeseries[val][0];
  data[i] = newValue;

  vizBody.selectAll('.series g.handle circle')
    .data(pie(data))
    .attr("cx", handleX)
    .attr("cy", handleY);

  vizBody.selectAll(".series g.slice path")
    .data(pie(data))
    .attr("d", window.bar);
}
