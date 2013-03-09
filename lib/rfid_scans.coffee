class RfidScan extends Backbone.Model
  initialize: =>
    @set('created_at', new Date(@get('created_at')))

class RfidScansCollection extends Backbone.Collection
  db:
    changes: true
  model: RfidScan
  url: '/rfid-scan'

_.extend(exports, {RfidScan, RfidScansCollection})
