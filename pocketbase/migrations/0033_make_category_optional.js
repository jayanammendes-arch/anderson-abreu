migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('treatments')
    const field = col.fields.getByName('category')
    if (field) {
      field.required = false
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('treatments')
    const field = col.fields.getByName('category')
    if (field) {
      field.required = true
    }
    app.save(col)
  },
)
