migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('is_active')) {
      col.fields.add(new BoolField({ name: 'is_active' }))
    }
    app.save(col)

    var records = app.findRecordsByFilter('treatment_categories', 'id != ""', 'order', 0, 0)
    for (var i = 0; i < records.length; i++) {
      var record = records[i]
      if (!record.get('is_active')) {
        record.set('is_active', true)
        app.save(record)
      }
    }
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    try {
      col.fields.removeByName('is_active')
      app.save(col)
    } catch (_) {}
  },
)
