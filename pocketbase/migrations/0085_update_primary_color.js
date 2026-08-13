migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')
    const records = app.findRecordsByFilter('platform_settings', '1=1', '', 0, 0)
    for (const record of records) {
      record.set('primary_color', '#00D2FF')
      app.save(record)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')
    const records = app.findRecordsByFilter('platform_settings', '1=1', '', 0, 0)
    for (const record of records) {
      record.set('primary_color', '')
      app.save(record)
    }
  },
)
