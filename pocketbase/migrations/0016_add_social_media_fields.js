migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('facebook_url')) {
      col.fields.add(new TextField({ name: 'facebook_url' }))
    }
    if (!col.fields.getByName('linkedin_url')) {
      col.fields.add(new TextField({ name: 'linkedin_url' }))
    }
    if (!col.fields.getByName('youtube_url')) {
      col.fields.add(new TextField({ name: 'youtube_url' }))
    }

    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('platform_settings')
      try {
        col.fields.removeByName('facebook_url')
      } catch (_) {}
      try {
        col.fields.removeByName('linkedin_url')
      } catch (_) {}
      try {
        col.fields.removeByName('youtube_url')
      } catch (_) {}
      app.save(col)
    } catch (_) {}
  },
)
