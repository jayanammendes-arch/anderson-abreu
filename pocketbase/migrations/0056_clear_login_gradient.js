migrate(
  (app) => {
    var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 100, 0)
    for (var i = 0; i < records.length; i++) {
      var rec = records[i]
      if (rec.getString('login_gradient') !== '') {
        rec.set('login_gradient', '')
        app.save(rec)
      }
    }
  },
  (app) => {},
)
