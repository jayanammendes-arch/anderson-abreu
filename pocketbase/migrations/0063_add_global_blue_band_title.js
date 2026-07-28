migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')
    if (!col.fields.getByName('global_blue_band_title')) {
      col.fields.add(new TextField({ name: 'global_blue_band_title' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')
    if (col.fields.getByName('global_blue_band_title')) {
      col.fields.removeByName('global_blue_band_title')
    }
    app.save(col)
  },
)
