class Beer extends Backbone.Model

class BeersCollection extends Backbone.Collection
  db:
    changes: true
  model: Beer
  url: '/beer'

_.extend(exports, {Beer, BeersCollection})
