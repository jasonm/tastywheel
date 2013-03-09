class Tapping extends Backbone.RelationalModel
  initialize: =>
    @set('started_at', new Date(@get('started_at')))
    @set('finished_at', new Date(@get('finished_at')))

Tapping.setup()

class TappingsCollection extends Backbone.Collection
  model: Tapping

_.extend(exports, {Tapping, TappingsCollection})
