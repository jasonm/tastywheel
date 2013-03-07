{Rating, RatingsCollection} = require('lib/rate')

class Beer extends Backbone.RelationalModel
  relations: [
    {
      type: Backbone.HasMany
      key: 'ratings'
      relatedModel: Rating
      collectionType: RatingsCollection
      reverseRelation: {
        key: 'beer'
      }
    }
  ]

Beer.setup()

class BeersCollection extends Backbone.Collection
  db:
    changes: true
  model: Beer
  url: '/beer'

_.extend(exports, {Beer, BeersCollection})
