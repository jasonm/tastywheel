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

    @flavors = ['Hoppy', 'Sweet', 'Creamy', 'Fruity', 'Roasty', 'Bitter', 'Citrus', 'Floral'];
    @values = [];

    _.times @flavors.length, =>
      @values.push(minVal)

    wheelEl    = @$('.wheel')

    wheel = new Wheel({
      rootEl: wheelEl,
      keys: @flavors,
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

  saveRating: (e) ->
    e.preventDefault()

    liked = @$('.slider').slider('option', 'value')

    rating = new Rating({
      liked: liked
      values: _.object(@flavors, @values)
      created_at: new Date()
    })

    @model.get('ratings').push(rating)
    @model.save()

    document.location.hash = '#thanks'


_.extend(exports, {RateView, Rating, RatingsCollection})
