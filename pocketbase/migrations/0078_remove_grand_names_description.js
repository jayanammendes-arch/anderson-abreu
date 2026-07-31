migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('about_grand_names')
    if (col.fields.getByName('description')) {
      col.fields.removeByName('description')
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('about_grand_names')
    if (!col.fields.getByName('description')) {
      col.fields.add(new TextField({ name: 'description' }))
    }
    app.save(col)
  },
)
