var timeseries, sdat, series, minVal = 2, maxVal = 6, radius, radiusLength;
var w = 500, h = 500, axis = 10, time = 10, ruleColor = '#CCC';
var innerRadiusIncrement = 10;
var vizPadding = {
  top: 25,
  right: 25,
  bottom: 25,
  left: 25
};
var numticks = maxVal / 0.5;
var viz, vizBody, maxs, keys;

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
  keys = ["x", "y", "z", "w", "u", "t", "a", "b"];

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

setScales = function () {
  var heightCircleConstraint,
      widthCircleConstraint,
      circleConstraint,
      centerXPos,
      centerYPos;

  //need a circle so find constraining dimension
  heightCircleConstraint = h - vizPadding.top - vizPadding.bottom;
  widthCircleConstraint = w - vizPadding.left - vizPadding.right;
  circleConstraint = d3.min([heightCircleConstraint, widthCircleConstraint]);

  radius = d3.scale.linear().domain([0, maxVal])
    .range([0, (circleConstraint / 2)]);
  radiusLength = radius(maxVal);

  //attach everything to the group that is centered around middle
  centerXPos = widthCircleConstraint / 2 + vizPadding.left;
  centerYPos = heightCircleConstraint / 2 + vizPadding.top;

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

var draw = function (val) {
  var groups,
      lines,
      linesToUpdate;

  groups = vizBody.selectAll('.series')
    .data(timeseries[val]);
  groups.enter().append("svg:g")
    .attr('class', 'series')
    .style('fill', "blue")
    .style('stroke', "blue");

  groups.exit().remove();

  lines = groups.append('svg:path')
    .attr("class", "line")
    .attr("id", "userdata")
    .attr("d", d3.svg.area.radial()
        .radius(function (d) { return 0; })
        .angle(function (d, i) { return (i / axis) * 2 * Math.PI; }))
    .style("stroke-width", 3)
    .style("fill", "red")
    .style("opacity", 0.4);

  lines.attr("d", d3.svg.area.radial()
      .outerRadius(function (d) { return radius(d); })
      .innerRadius(function(d) { return 0; })
      .angle(function (d, i) { return (i / axis) * 2 * Math.PI; }));
};


var drawBars = function(val) {
  var groups, bar;
  pie = d3.layout.pie().value(function(d) { return d; }).sort(null);
  d = [];
  for(i = 0; i<timeseries[val][0].length; i++) { d.push(1); }

  groups = vizBody.selectAll('.series')
    .data([d]);
  groups.enter().append("svg:g")
    .attr('class', 'series')
    .style('fill', "blue")
    .style('stroke', "black");

  groups.exit().remove();

  // var colors = ["red", "brown", "yellow", "green", "blue", "indigo", "violet", "black"];
  var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

  bar = d3.svg.arc()
    .innerRadius( innerRadiusIncrement * w / 100.0 )
    .outerRadius( function(d,i) { return radius( timeseries[val][0][i] ); });

  arcs = groups.selectAll(".series g.arc")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "attr");


  arcs.append("path")
    .attr("fill", function(d,i) { return colors[i % 8]; })
    // .attr("fill", function(d, i) { return d3.scale.category20()(i); })
    .attr("d", bar)
    .style("opacity", 0.6);
}

function redraw( val ) {        
  vizBody.selectAll('#userdata').remove();
  drawBar( val );
}
