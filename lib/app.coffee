{Beer, BeersCollection} = require('lib/beers')
{AttractView} = require('lib/attract')
{PickView} = require('lib/pick')
{RateView} = require('lib/rate')
{ThanksView} = require('lib/thanks')

Router =
  class Router extends Backbone.Router
    initialize: (rootEl) =>
      @rootEl = rootEl

    routes:
      '':         'attract'
      'attract':  'showHash'
      'pick':     'showHash'
      'rate/:id': 'rate'
      'thanks':   'thanks'

    showPane: (pane) =>
      @rootEl.find('>div').hide()
      @rootEl.find("#region-#{pane}").show()

    attract: =>
      @showPane 'attract'

    thanks: =>
      @showPane 'thanks'
      # TODO: inject views or something
      app.views.thanks.fadeOut()

    rate: (beerId) =>
      # TODO: inject views or something
      # TODO: handle the async collection load
      app.views.rate.model = app.collections.beers.get(beerId)
      app.views.rate.render()
      @showPane 'rate'

    showHash: =>
      @showPane document.location.hash.replace('#', '')

class App
  constructor: (dbName, appName, rootEl) ->
    Backbone.couch_connector.config.collection_field_identifier = 'type'
    Backbone.couch_connector.config.db_name = dbName
    Backbone.couch_connector.config.ddoc_name = appName
    Backbone.couch_connector.config.global_changes = true
    @collections = {}
    @rootEl = rootEl

  run: =>
    app.collections =
      beers: new BeersCollection()

    app.collections.beers.on 'reset', =>
      @setup 'attract', AttractView
      @setup 'pick',    PickView
      @setup 'rate',    RateView
      @setup 'thanks',  ThanksView

      app.views.attract.collection = app.collections.beers
      app.views.attract.render()

      app.views.pick.collection = app.collections.beers
      app.views.pick.render()

      @router = new Router(@rootEl)
      Backbone.history.start()

    app.collections.beers.fetch()

  setup: (regionName, viewType) =>
    view = new viewType()
    view.render()

    app.views ?= {}
    app.views[regionName] = view

    @rootEl.find("#region-#{regionName}").append(view.$el)

exports.App = App
