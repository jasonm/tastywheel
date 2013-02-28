function Wheel(options) {
  var self = this;

  var opacityLow = 0.6;
  var opacityMedium = 0.8;
  var opacityHigh = 0.8;

  var keys = options.keys;
  var data = options.values;
  var onDataChange = options.onDataChange || function(){};
  var rootEl = options.rootEl;

  var radius, radiusLength;
  var w = options.width || 800;
  var h = options.height || 800;
  var ruleColor = '#CCC';
  var innerRadiusIncrement = options.innerRadiusIncrement;
  var vizPadding = {
    top: 25,
    right: 25,
    bottom: 25,
    left: 25
  };
  var minVal = options.minVal || Math.min.apply(null, data);
  var maxVal = options.maxVal || Math.max.apply(null, data);
  var numticks = options.numticks || (maxVal - minVal + 1);
  var viz, vizBody, maxs
  var color = function(i) {
    var colors =  ['#8D5103', '#F0A800', '#FFD600', '#F76F05','#590808', '#3D0C0A', '#520707',  '#680808'];
    return colors[i % colors.length];
  }

  var buildBase = function(){
    viz = d3.select($(rootEl)[0])
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

  var setScales = function () {
    var centerXPos,
        centerYPos,
        heightCircleConstraint,
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
    var radialTicks = radius.ticks(numticks), circleAxes, i, sdat = [];
    for (i=0; i<=numticks; i++) {
      sdat[i] = (maxVal/numticks) * i;
    }

    vizBody.selectAll('.circle-ticks').remove();

    circleAxes = vizBody.selectAll('.circle-ticks')
      .data(sdat)
      .enter().append('svg:g')
      .attr("class", "circle-ticks");

    circleAxes.append("svg:circle")
      .attr("r", function (d, i) { return radius(d); })
      .attr("class", "circle")
      .style("stroke", ruleColor)
      .style("opacity", opacityHigh)
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
      .style("opacity", opacityHigh)
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

  var angleOffset = -Math.PI / keys.length;

  var pie = d3.layout.pie()
    .value(function(d) { return 1; })
    .sort(null)
    .startAngle(angleOffset)
    .endAngle(angleOffset + 2 * Math.PI);

  var bar = d3.svg.arc()
    .innerRadius( function() {
      return innerRadiusIncrement * w / 100.0;
    })
    .outerRadius( function(d,i) { 
      return radius( d.data );
    });

  var handleX = function(d, i) {
    var midAngle =
      ((d.startAngle + d.endAngle) * 0.5)
      -  (Math.PI / 2.0); // D3 seems to operate on a different quadrant basis?

    var handleRadius = radius(d.data);
    return handleRadius * Math.cos(midAngle);
  };

  var handleY = function(d, i) {
    var midAngle =
      ((d.startAngle + d.endAngle) * 0.5)
      -  (Math.PI / 2.0); // D3 seems to operate on a different quadrant basis?
    var handleRadius = radius(d.data);
    return handleRadius * Math.sin(midAngle);
  };

  var dragHandle = d3.behavior.drag()
    .on("dragstart", function(d, i) {
      var handle = d3.select(this);
      self.setFocus(i);
      handle.style("fill", "#fff");
      onDataChange(data, i);
    })
    .on("dragend", function(d, i) {
      var slice = d3.select(vizBody.selectAll(".series g.slice path")[0][i]);
      var handle = d3.select(this);
      self.setFocus(null);
      handle.style("fill", "#ddd");
      onDataChange(data, i);
    })
    .on("drag", function(d,i) {
      var newRadius = Math.sqrt(d3.event.x * d3.event.x +
                                d3.event.y * d3.event.y);

      var newValue = radius.invert(newRadius);

      if (newValue < minVal) { newValue = minVal; }
      if (newValue > maxVal) { newValue = maxVal; }

      updateData(i, newValue);
      onDataChange(data, i);
    });

  var focus = 0;
  this.setFocus = function(newFocus) {
    focus = newFocus;

    vizBody.selectAll(".series g.slice path")
      .data(pie(data))
      .attr("d", bar)
      .style("fill-opacity", function(d, i) {
        if (focus == null) {
          return opacityMedium;
        } else {
          return (focus == i) ? opacityHigh : opacityLow;
        }
      });
  }
  var drawBars = function() {

    var groups = vizBody.selectAll('.series')
      .data(["only one series"]);
    groups.enter().append("svg:g")
      .attr('class', 'series')
      .style('fill', "blue")
      .style('stroke', "black");

    groups.exit().remove();


    var arcs = groups.selectAll(".series g.arc")
      .data(pie(data));

    arc = arcs
      .enter()
      .append("g")
        .attr("class", "slice")
      .append("path")
        .attr("fill", function(d,i) { return color(i); })
        .attr("d", bar)
        .style("fill-opacity", opacityMedium);

    var width = 10;
    var height = 10;
    var handleRad = 10;

    var handles = groups.selectAll(".series g.handle")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "handle");

    handles.append("circle")
      .call(dragHandle)
      .attr("fill", "#ddd")
      .attr("stroke", "#666")
      .attr("stroke-width", "3")
      .attr("cx", handleX)
      .attr("cy", handleY)
      .attr("r", handleRad);
  }

  var updateData = function(i, newValue) {
    data[i] = newValue;

    vizBody.selectAll('.series g.handle circle')
      .data(pie(data))
      .attr("cx", handleX)
      .attr("cy", handleY);

    vizBody.selectAll(".series g.slice path")
      .data(pie(data))
      .attr("d", bar);
  }

  var transitionData = function(newData) {
    data = newData;

    vizBody.selectAll('.series g.handle circle')
      .data(pie(data));

    vizBody.selectAll(".series g.slice path")
      .data(pie(data));

    var t = vizBody.transition().duration(750);

    t.selectAll('.series g.handle circle')
      .attr("cx", handleX)
      .attr("cy", handleY);

    t.selectAll(".series g.slice path")
      .attr("d", bar);
  };

  buildBase();
  setScales();
  if (options.lineAxes) {
    addLineAxes();
  }
  if (options.circleAxes) {
    addCircleAxes();
  }
  drawBars();

  this.updateData = updateData;
  this.transitionData = transitionData;

  return this;
}
