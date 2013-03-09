class PickView extends Backbone.Marionette.ItemView
  tagName: 'div'
  template: 'pick/index.html'

  initialize: =>
    @drinks = []

  setDrinks: (newDrinks) =>
    @drinks = newDrinks
    @render()

  serializeData: =>
    data = {}
    data.beers = @collection.toJSON() if @collection

    if _.any(@drinks)
      data.tag_id = @drinks[0].tag_id
      data.drinks = _.map @drinks, (drink) ->
        _.extend drink, {
          beer: drink.beer.toJSON()
          drank_at: moment(drink.drank_at).format("dddd, hh:mm:ssA")
        }

    data

_.extend(exports, {PickView})
