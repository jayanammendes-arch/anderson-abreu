migrate(
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('about_environment_images')

      var existing = []
      try {
        existing = app.findRecordsByFilter('about_environment_images', "id != ''", 'order', 100, 0)
      } catch (_) {}

      for (var i = 0; i < existing.length; i++) {
        app.delete(existing[i])
      }

      for (var e = 1; e <= 4; e++) {
        var envRec = new Record(col)
        envRec.set('order', e)
        envRec.set('image', '')
        app.save(envRec)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      var existing = app.findRecordsByFilter(
        'about_environment_images',
        "id != ''",
        'order',
        100,
        0,
      )
      for (var i = 0; i < existing.length; i++) {
        app.delete(existing[i])
      }
      var col = app.findCollectionByNameOrId('about_environment_images')
      for (var e = 1; e <= 3; e++) {
        var envRec = new Record(col)
        envRec.set('order', e)
        envRec.set('image', '')
        app.save(envRec)
      }
    } catch (_) {}
  },
)
