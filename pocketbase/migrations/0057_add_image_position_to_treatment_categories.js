migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    if (!col.fields.getByName('image_position')) {
      col.fields.add(
        new SelectField({
          name: 'image_position',
          values: ['top', 'center', 'bottom', 'left', 'right', 'center-left', 'center-right'],
          maxSelect: 1,
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    var field = col.fields.getByName('image_position')
    if (field) {
      col.fields.remove(field.getId())
    }
    app.save(col)
  },
)
