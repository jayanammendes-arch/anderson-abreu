migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('hypnosis_info_image')) {
      col.fields.add(
        new FileField({
          name: 'hypnosis_info_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('platform_settings')
      col.fields.removeByName('hypnosis_info_image')
      app.save(col)
    } catch (_) {}
  },
)
