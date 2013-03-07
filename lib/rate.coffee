class Rating extends Backbone.RelationalModel

Rating.setup()

class RatingsCollection extends Backbone.Collection
  db:
    changes: true
  model: Rating
  url: '/rating'

class RateView extends Backbone.Marionette.ItemView
  tagName: 'div'
  template: 'rate/index.html'

  events:
    'click a.save-rating': 'saveRating'

  onRender: =>
    wheel = null

    minVal = 3;
    maxVal = 10;

    flavors = ['Hoppy', 'Sweet', 'Creamy', 'Fruity', 'Roasty', 'Bitter', 'Citrus', 'Floral'];
    @values = [];

    _.times flavors.length, =>
      @values.push(minVal)

    wheelEl    = @$('.wheel')

    wheel = new Wheel({
      rootEl: wheelEl,
      keys: flavors,
      values: @values,
      minVal: minVal,
      maxVal: maxVal,
      numticks: 5,
      lineAxes: true,
      circleAxes: false,
      innerRadiusIncrement: 9.2 # why?
    })

    wheel.transitionData(@values)

    @$('.slider').slider
      value: (minVal + maxVal) / 2.0
      min: minVal
      max: maxVal
      range: "min"
      step: 0.01

  saveRating: ->
    liked = @$('.slider').slider('option', 'value')
    values = @values
    alert("saving #{liked} and #{values}")
    document.location.hash = '#thanks'


_.extend(exports, {RateView, Rating, RatingsCollection})
