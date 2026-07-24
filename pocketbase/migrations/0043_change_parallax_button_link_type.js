migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (col.fields.getByName('parallax_button_link')) {
      col.fields.removeByName('parallax_button_link')
    }

    col.fields.add(new TextField({ name: 'parallax_button_link', required: false }))

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (col.fields.getByName('parallax_button_link')) {
      col.fields.removeByName('parallax_button_link')
    }

    col.fields.add(new URLField({ name: 'parallax_button_link', required: false }))

    app.save(col)
  },
)
