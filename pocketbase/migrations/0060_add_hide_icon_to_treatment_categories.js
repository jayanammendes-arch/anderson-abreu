migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    if (!col.fields.getByName('hide_icon')) {
      col.fields.add(new BoolField({ name: 'hide_icon' }))
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    try {
      col.fields.removeByName('hide_icon')
    } catch (_) {}
    app.save(col)
  },
)
