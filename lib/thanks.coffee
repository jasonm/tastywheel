class ThanksView extends Backbone.Marionette.ItemView
  tagName: 'div'
  template: 'thanks/index.html'

  fadeOut: =>
    delay = 3000

    @$('h1').css('opacity', '1.0');
    t = d3.select(@el).transition().duration(delay);

    t.selectAll('h1')
      .ease('quad-in')
      .style('opacity', '0.0');

    setTimeout =>
      document.location.hash = '#attract'
    , delay + 1000

_.extend(exports, {ThanksView})
