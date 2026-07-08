migrate(
  (app) => {
    const eventsCol = app.findCollectionByNameOrId('events')
    if (!eventsCol.fields.getByName('image')) {
      eventsCol.fields.add(
        new FileField({
          name: 'image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(eventsCol)
  },
  (app) => {
    const eventsCol = app.findCollectionByNameOrId('events')
    try {
      eventsCol.fields.removeByName('image')
    } catch (_) {}
    app.save(eventsCol)
  },
)
