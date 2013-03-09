class Reader extends Backbone.Model

class ReadersCollection extends Backbone.Collection
  db:
    changes: true
  model: Reader
  url: '/rfid-reader'

_.extend(exports, {Reader, ReadersCollection})
