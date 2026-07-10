migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('lesson_materials')
    if (!col.fields.getByName('module')) {
      var modulesCol = app.findCollectionByNameOrId('modules')
      col.fields.add(
        new RelationField({
          name: 'module',
          required: false,
          collectionId: modulesCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        }),
      )
    }
    if (!col.fields.getByName('file_size')) {
      col.fields.add(new NumberField({ name: 'file_size' }))
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('lesson_materials')
    var moduleField = col.fields.getByName('module')
    if (moduleField) col.fields.remove(moduleField.getId())
    var sizeField = col.fields.getByName('file_size')
    if (sizeField) col.fields.remove(sizeField.getId())
    app.save(col)
  },
)
