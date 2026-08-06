migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('blue_band_image')) {
      col.fields.add(
        new FileField({
          name: 'blue_band_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('platform_settings')
    if (col.fields.getByName('blue_band_image')) {
      col.fields.removeByName('blue_band_image')
    }
    app.save(col)
  },
)
