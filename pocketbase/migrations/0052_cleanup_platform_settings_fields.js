migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('platform_settings')

    var fieldsToRemove = [
      'services_title',
      'services_subtitle',
      'services_items',
      'testimonials_active',
    ]

    for (var i = 0; i < fieldsToRemove.length; i++) {
      try {
        col.fields.removeByName(fieldsToRemove[i])
      } catch (_) {}
    }

    app.save(col)
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('platform_settings')

      if (!col.fields.getByName('services_title')) {
        col.fields.add(new TextField({ name: 'services_title' }))
      }
      if (!col.fields.getByName('services_subtitle')) {
        col.fields.add(new TextField({ name: 'services_subtitle' }))
      }
      if (!col.fields.getByName('services_items')) {
        col.fields.add(new JSONField({ name: 'services_items', maxSize: 5242880 }))
      }
      if (!col.fields.getByName('testimonials_active')) {
        col.fields.add(new BoolField({ name: 'testimonials_active' }))
      }

      app.save(col)
    } catch (_) {}
  },
)
