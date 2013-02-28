class WelcomeView extends Backbone.Marionette.ItemView
  tagName: 'div'
  template: 'welcome/index.html'

  fadeOut: =>
    delay = 3000

    @$('h1').css('line-height', '140px').css('opacity', '1.0');
    t = d3.select(@el).transition().duration(delay);

    t.selectAll('h1')
      .ease('quad-in')
      .style('line-height', '200px')
      .style('opacity', '0.0');

    setTimeout =>
      document.location.hash = '#pick'
    , delay + 1000

_.extend(exports, {WelcomeView})
