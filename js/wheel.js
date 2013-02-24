function Wheel(options) {
  var self = this;

  var keys = options.keys;
  var data = options.values;
  var onDataChange = options.onDataChange;

  var radius, radiusLength;
  var w = 600, h = 600, ruleColor = '#CCC';
  var innerRadiusIncrement = 10;
  var vizPadding = {
    top: 25,
    right: 25,
    bottom: 25,
    left: 25
  };
  var minVal = options.minVal;
  var maxVal = options.maxVal;
  var numticks = maxVal / 0.5;
  var viz, vizBody, maxs
  var sdat = [];
  var color = d3.scale.category10();

  for (i=0; i<=numticks; i++) {
    sdat[i] = (maxVal/numticks) * i;
  }

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
  var setScales = function () {
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

  var addCircleAxes = function() {
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

  var addLineAxes = function () {
    var radialTicks = radius.ticks(numticks), lineAxes;

    vizBody.selectAll('.line-ticks').remove();

    lineAxes = vizBody.selectAll('.line-ticks')
      .data(keys)
      .enter().append('svg:g')
      .attr("transform", function (d, i) {
        return "rotate(" + ((i / keys.length * 360) - 90) +
        ")translate(" + radius(maxVal) + ")";
      })
    .attr("class", "line-ticks");

    lineAxes.append('svg:line')
      .attr("x2", -1 * radius(maxVal))
      .style("stroke", ruleColor)
      .style("opacity", 0.75)
      .style("fill", "none");

    lineAxes.append('svg:text')
      .text(function(d,i){ return keys[i]; })
      .attr("text-anchor", "middle")
           .attr("transform", function (d, i) {
             var increment = 360.0 / keys.length;
             var angle = 90 - (increment * i);
             return "rotate(" + angle + ")";
           });
  };

  var handleX, handleY, pie, groups, bar, arcs;
  var drawBars = function(val) {
    handleX = function(d, i) {
      var midAngle =
        ((d.startAngle + d.endAngle) * 0.5)
        -  (Math.PI / 2.0); // D3 seems to operate on a different quadrant basis?

      var handleRadius = radius(d.data);
      return handleRadius * Math.cos(midAngle);
    };

    handleY = function(d, i) {
      var midAngle =
        ((d.startAngle + d.endAngle) * 0.5)
        -  (Math.PI / 2.0); // D3 seems to operate on a different quadrant basis?
      var handleRadius = radius(d.data);
      return handleRadius * Math.sin(midAngle);
    };

    var drag = d3.behavior.drag()
      .on("dragstart", function(d, i) {
        var slice = d3.select(vizBody.selectAll(".series g.slice path")[0][i]);
        var handle = d3.select(this);

        slice.attr("fill-opacity", 0.5);
        handle.style("fill", "#fff");
      })
      .on("dragend", function(d, i) {
        var slice = d3.select(vizBody.selectAll(".series g.slice path")[0][i]);
        var handle = d3.select(this);

        slice.attr("fill-opacity", 0.6);
        handle.style("fill-opacity", 1.0);
        handle.style("fill", "#ddd");

      })
      .on("drag", function(d,i) {

        var x = d3.event.x;
        var y = d3.event.y;

        var newMagnitude = Math.sqrt(x * x + y * y);
        var newValue = radius.invert(newMagnitude);

        if (newValue < minVal) { newValue = minVal; }
        if (newValue > maxVal) { newValue = maxVal; }

        updateData(val, i, newValue);
      });

    pie = d3.layout.pie().value(function(d) { return 1; }).sort(null);

    ones = [];
    for(i = 0; i<data.length; i++) { ones.push(1); }
    // d = [1,2,3,5,8,11,19,30]; // different pie slice widths

    groups = vizBody.selectAll('.series')
      .data([ones]);
    groups.enter().append("svg:g")
      .attr('class', 'series')
      .style('fill', "blue")
      .style('stroke', "black");

    groups.exit().remove();

    bar = d3.svg.arc()
      .innerRadius( innerRadiusIncrement * w / 100.0 )
      .outerRadius( function(d,i) { 
        return radius( d.data );
      });

    arcs = groups.selectAll(".series g.arc")
      .data(pie(data));

    arc = arcs
      .enter()
      .append("g")
        .attr("class", "slice")
      .append("path")
        .attr("fill", function(d,i) { return color(i); })
        .attr("d", bar)
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

  var updateData = function(val, i, newValue) {
    data[i] = newValue;

    vizBody.selectAll('.series g.handle circle')
      .data(pie(data))
      .attr("cx", handleX)
      .attr("cy", handleY);

    vizBody.selectAll(".series g.slice path")
      .data(pie(data))
      .attr("d", bar);

    if (onDataChange) {
      onDataChange(data, i);
    }
  }

  buildBase();
  setScales();
  drawBars(0);
  addLineAxes();
  addCircleAxes();

  return this;
}
