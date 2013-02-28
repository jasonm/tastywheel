class RateView extends Backbone.Marionette.ItemView
  tagName: 'div'
  template: 'rate/index.html'

  onRender: =>
    wheel = null

    minVal = 3;
    maxVal = 10;

    flavors = ['Hoppy', 'Sweet', 'Creamy', 'Fruity', 'Roasty', 'Bitter', 'Citrus', 'Floral'];
    values = [];

    _.times flavors.length, ->
      values.push(minVal)

    wheelEl    = @$('.wheel')

    wheel = new Wheel({
      rootEl: wheelEl,
      keys: flavors,
      values: values,
      minVal: minVal,
      maxVal: maxVal,
      numticks: 5,
      lineAxes: true,
      circleAxes: false,
      innerRadiusIncrement: 9.2 # why?
    })

    wheel.transitionData(values)

    @$('.slider').slider
      value: (minVal + maxVal) / 2.0
      min: minVal
      max: maxVal
      range: "min"
      step: 0.01

_.extend(exports, {RateView})
