{RfidScan, RfidScansCollection} = require('lib/rfid_scans')
{Reader, ReadersCollection} = require('lib/readers')
{Tap, TapsCollection} = require('lib/taps')

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
      window.app.currentPane = pane
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
    Backbone.couch_connector.config.single_feed = true
    @collections = {}
    @rootEl = rootEl

  run: =>
    if reader_id_match = document.location.search.match(/reader_id=([^&]*)/)
      window.reader_id = reader_id_match[1]
    else
      $('#wrap').prepend("<h1>Please pass ?reader_id on the URL</h1><h2>so the app knows what reader is attached.</h2>")

    app.collections =
      beers: new BeersCollection()
      rfid_scans: new RfidScansCollection()
      readers: new ReadersCollection()
      taps: new TapsCollection()

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
    app.collections.readers.fetch()
    app.collections.taps.fetch()

    window.testScan = ->
      s = app.collections.rfid_scans.get('4aa5b1da7b3c14cdd700f526b2dc77f6')
      window.reader_id = s.get('reader_id')
      window.handleNewScan(s)

    window.handleNewScan = (newScan) =>
      if @currentPane == 'attract'
        if newScan.get('reader_id') == reader_id
          scansForTag = app.collections.rfid_scans.where
            tag_id: newScan.get('tag_id')

          tapReaderIds = _(app.collections.taps.pluck('reader_id'))

          drinks = []

          _.each scansForTag, (scan) ->
            if tap = app.collections.taps.findWhere({ reader_id: scan.get('reader_id') })
              tapping = tap.get('tappings').detect (tapping) ->
                (tapping.get('started_at') < scan.get('created_at')) && (tapping.get('finished_at') > scan.get('created_at'))

              if tapping
                drinks.push
                  tag_id: newScan.get('tag_id')
                  reader_id: scan.get('reader_id')
                  tap_name: tap.get('name')
                  drank_at: scan.get('created_at')
                  beer: app.collections.beers.get(tapping.get('beer_id'))

          @views.pick.setDrinks(drinks)
          @router.navigate('pick', true)

    app.collections.rfid_scans.fetch().then =>
      app.collections.rfid_scans.on 'add', (newScan, _, options) =>
        window.handleNewScan(newScan)

  setup: (regionName, viewType) =>
    view = new viewType()
    view.render()

    app.views ?= {}
    app.views[regionName] = view

    @rootEl.find("#region-#{regionName}").append(view.$el)

exports.App = App
