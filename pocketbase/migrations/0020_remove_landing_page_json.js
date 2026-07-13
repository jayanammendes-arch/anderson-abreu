migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')
    if (col.fields.getByName('landing_page_json')) {
      col.fields.removeByName('landing_page_json')
    }
    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('platform_settings')
      if (!col.fields.getByName('landing_page_json')) {
        col.fields.add(new JSONField({ name: 'landing_page_json' }))
      }
      app.save(col)
    } catch (_) {}
  },
)
