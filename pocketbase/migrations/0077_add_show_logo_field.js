migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')
    if (!col.fields.getByName('show_logo')) {
      col.fields.add(new BoolField({ name: 'show_logo' }))
    }
    app.save(col)

    try {
      const records = app.findRecordsByFilter('platform_settings', 'id != ""', '', 0, 0)
      for (const record of records) {
        record.set('show_logo', true)
        app.save(record)
      }
    } catch (_) {}
  },
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')
    if (col.fields.getByName('show_logo')) {
      col.fields.removeByName('show_logo')
    }
    app.save(col)
  },
)
