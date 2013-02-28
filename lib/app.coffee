{Beer, BeersCollection} = require('lib/beers')
{AttractView} = require('lib/attract')
{WelcomeView} = require('lib/welcome')
{PickView} = require('lib/pick')
{RateView} = require('lib/rate')
{ThanksView} = require('lib/thanks')

Router =
  class Router extends Backbone.Router
    initialize: (rootEl) =>
      @rootEl = rootEl

    routes:
      '':        'attract'
      'attract': 'showHash'
      'welcome': 'showHash'
      'pick':    'showHash'
      'rate':    'showHash'
      'thanks':  'showHash'

    showPane: (pane) =>
      @rootEl.find('>div').hide()
      @rootEl.find("#region-#{pane}").show()

    attract: =>
      @showPane 'attract'

    showHash: =>
      @showPane document.location.hash.replace('#', '')

class App
  constructor: (dbName, appName, rootEl) ->
    Backbone.couch_connector.config.collection_field_identifier = 'type'
    Backbone.couch_connector.config.db_name = dbName
    Backbone.couch_connector.config.ddoc_name = appName
    Backbone.couch_connector.config.global_changes = false
    @collections = {}
    @rootEl = rootEl

  run: =>
    @setup 'attract', AttractView, 'beers', BeersCollection
    @setup 'welcome', WelcomeView, null,    null
    @setup 'pick',    PickView,    'beers', BeersCollection
    @setup 'rate',    RateView,    null,    null
    @setup 'thanks',  ThanksView,  null,    null

    @router = new Router(@rootEl)
    Backbone.history.start()

  setup: (regionName, viewType, collectionName, collectionType, fetchOptions = {}) =>
    view = null

    if collectionType
      unless @collections[collectionName]
        collection = new collectionType()
        collection.fetch(fetchOptions)
        @collections[collectionName] = collection

      view = new viewType({ collection: collection })
    else
      view = new viewType()

    view.render()
    app.views ?= {}
    app.views[regionName] = view

    @rootEl.find("#region-#{regionName}").append(view.$el)

exports.App = App
