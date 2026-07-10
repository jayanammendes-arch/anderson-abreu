migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('user_progress')
    if (!col.fields.getByName('video_position')) {
      col.fields.add(new NumberField({ name: 'video_position' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('user_progress')
    const field = col.fields.getByName('video_position')
    if (field) {
      col.fields.remove(field.getId())
    }
    app.save(col)
  },
)
