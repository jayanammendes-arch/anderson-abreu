migrate(
  (app) => {
    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 0, 0)
      for (const record of records) {
        record.set('primary_color', '#D4AF37')
        record.set('login_gradient', '')
        app.save(record)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 0, 0)
      for (const record of records) {
        record.set('primary_color', '#00A3C4')
        app.save(record)
      }
    } catch (_) {}
  },
)
