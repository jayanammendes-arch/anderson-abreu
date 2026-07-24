migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('credentials_image')) {
      col.fields.add(
        new FileField({
          name: 'credentials_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('platform_settings')
      col.fields.removeByName('credentials_image')
      app.save(col)
    } catch (_) {}
  },
)
