migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('quizzes')
    if (!col.fields.getByName('is_active')) {
      col.fields.add(new BoolField({ name: 'is_active' }))
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('quizzes')
    var field = col.fields.getByName('is_active')
    if (field) col.fields.remove(field.getId())
    app.save(col)
  },
)
