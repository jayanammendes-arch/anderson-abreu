migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('about_environment_images')

    try {
      var f = col.fields.getByName('image')
      if (f) {
        f.required = false
      }
      app.save(col)
    } catch (_) {}

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
    } catch (_) {}

    for (var e = 1; e <= 4; e++) {
      var rec = new Record(col)
      rec.set('order', e)
      try {
        app.save(rec)
      } catch (_) {
        try {
          app.saveNoValidate(rec)
        } catch (_) {}
      }
    }
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
    } catch (_) {}
  },
)
