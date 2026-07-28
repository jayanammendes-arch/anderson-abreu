migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('faixa_text')) {
      col.fields.add(new TextField({ name: 'faixa_text' }))
    }
    if (!col.fields.getByName('sintomas_text')) {
      col.fields.add(new EditorField({ name: 'sintomas_text', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('sintomas_image')) {
      col.fields.add(
        new FileField({
          name: 'sintomas_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(col)

    var settingsCol = app.findCollectionByNameOrId('platform_settings')
    if (!settingsCol.fields.getByName('treatments_accordion_enabled')) {
      settingsCol.fields.add(new BoolField({ name: 'treatments_accordion_enabled' }))
    }
    app.save(settingsCol)

    try {
      var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) {
        var record = records[0]
        record.set('treatments_accordion_enabled', false)
        app.save(record)
      }
    } catch (_) {}
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    try {
      col.fields.removeByName('faixa_text')
    } catch (_) {}
    try {
      col.fields.removeByName('sintomas_text')
    } catch (_) {}
    try {
      col.fields.removeByName('sintomas_image')
    } catch (_) {}
    app.save(col)

    var settingsCol = app.findCollectionByNameOrId('platform_settings')
    try {
      settingsCol.fields.removeByName('treatments_accordion_enabled')
    } catch (_) {}
    app.save(settingsCol)
  },
)
