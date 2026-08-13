migrate(
  (app) => {
    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '', 1, 0)
      if (records.length > 0) {
        const record = records[0]
        record.set('primary_color', '#D4AF37')
        app.save(record)
      }
    } catch (_) {
      console.log('platform_settings record not found, skipping primary_color update')
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '', 1, 0)
      if (records.length > 0) {
        const record = records[0]
        record.set('primary_color', '')
        app.save(record)
      }
    } catch (_) {}
  },
)
