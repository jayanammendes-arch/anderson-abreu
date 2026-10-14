// Define about_media_visible = false por padrão em platform_settings para deixar a seção 'Na Mídia' oculta
migrate(
  (app) => {
    var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 100, 0)
    for (var i = 0; i < records.length; i++) {
      var rec = records[i]
      rec.set('about_media_visible', false)
      app.save(rec)
    }
  },
  (app) => {
    var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 100, 0)
    for (var i = 0; i < records.length; i++) {
      var rec = records[i]
      rec.set('about_media_visible', true)
      app.save(rec)
    }
  },
)
