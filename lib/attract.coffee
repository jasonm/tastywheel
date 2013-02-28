class AttractView extends Backbone.Marionette.ItemView
  tagName: 'div'
  template: 'attract/index.html'

  onRender: =>
    wheel = null

    minVal = 3;
    maxVal = 10;

    flavors = ['Hoppy', 'Sweet', 'Creamy', 'Fruity', 'Roasty', 'Bitter', 'Citrus', 'Floral'];
    values = [];

    _.times flavors.length, ->
      values.push(minVal)

    beers = [
      { name: 'Pliny the Elder',               ratings: [9.0, 5.0, 3.0, 7.0, 3.0, 9.0, 9.0, 8.5] },
      { name: 'Founders Breakfast Stout',      ratings: [4.0, 6.0, 8.0, 4.0, 9.0, 4.0, 3.0, 4.0] },
      { name: 'Vanilla Bean Dark Lord',        ratings: [4.0, 8.5, 9.0, 5.0, 8.0, 5.0, 3.0, 3.0] },
      { name: 'Cantillon Sain Lamvinus',       ratings: [3.0, 7.0, 3.0, 9.0, 3.0, 4.0, 5.0, 3.5] },
      { name: 'Weihenstephaner Hefeweissbier', ratings: [4.5, 8.0, 9.0, 5.0, 3.0, 4.0, 8.0, 5.0] }
    ]

    carouselEl = @$('div#attract-carousel')
    inner      = @$('div.carousel-inner')
    indicators = @$('ol.carousel-indicators')
    wheelEl    = @$('#radial')

    _.each beers, (beer, index) ->
      inner.append('<div class="item"><h1>' + beer.name + '</h1></div>')
      indicators.append('<li data-target="#attract-carousel" data-slide-to="' + index + '"></li>')

    inner.find('> div').first().addClass('active')
    indicators.find('> li').first().addClass('active')
    carouselEl.carousel({ interval: 4000 })

    carouselEl.on 'slide', (e) ->
      index = $(e.relatedTarget).index('#attract-carousel .item')
      wheel.transitionData(beers[index].ratings)

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

    wheel.transitionData(beers[0].ratings)

_.extend(exports, {AttractView})
