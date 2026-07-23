migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatments')

    var categoryField = col.fields.getByName('category')
    if (categoryField) {
      categoryField.required = false
    }

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatments')
    var categoryField = col.fields.getByName('category')
    if (categoryField) {
      categoryField.required = true
    }
    app.save(col)
  },
)
