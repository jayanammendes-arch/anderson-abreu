migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('platform_settings')

    var fieldsToRemove = [
      'about_title',
      'about_intro',
      'about_content',
      'about_credentials',
      'about_image',
      'about_page_image',
      'credentials_image',
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

      if (!col.fields.getByName('about_title')) {
        col.fields.add(new TextField({ name: 'about_title' }))
      }
      if (!col.fields.getByName('about_intro')) {
        col.fields.add(new TextField({ name: 'about_intro' }))
      }
      if (!col.fields.getByName('about_content')) {
        col.fields.add(new EditorField({ name: 'about_content', maxSize: 5242880 }))
      }
      if (!col.fields.getByName('about_credentials')) {
        col.fields.add(new TextField({ name: 'about_credentials' }))
      }
      if (!col.fields.getByName('about_image')) {
        col.fields.add(
          new FileField({
            name: 'about_image',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          }),
        )
      }
      if (!col.fields.getByName('about_page_image')) {
        col.fields.add(
          new FileField({
            name: 'about_page_image',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          }),
        )
      }
      if (!col.fields.getByName('credentials_image')) {
        col.fields.add(
          new FileField({
            name: 'credentials_image',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          }),
        )
      }

      app.save(col)
    } catch (_) {}
  },
)
