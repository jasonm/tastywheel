{Tapping, TappingsCollection} = require 'lib/tappings'

class Tap extends Backbone.RelationalModel
  relations: [
    {
      type: Backbone.HasMany,
      key: 'tappings',
      relatedModel: Tapping,
      collectionType: TappingsCollection
      reverseRelation: {
        key: 'tap'
      }
    }
  ]

Tap.setup()

class TapsCollection extends Backbone.Collection
  db:
    changes: true
  model: Tap
  url: '/tap'

_.extend(exports, {Tap, TapsCollection})
