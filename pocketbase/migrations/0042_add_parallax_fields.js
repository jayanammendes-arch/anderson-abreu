migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('parallax_background_image')) {
      col.fields.add(
        new FileField({
          name: 'parallax_background_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!col.fields.getByName('parallax_headline')) {
      col.fields.add(new TextField({ name: 'parallax_headline' }))
    }
    if (!col.fields.getByName('parallax_button_text')) {
      col.fields.add(new TextField({ name: 'parallax_button_text' }))
    }
    if (!col.fields.getByName('parallax_button_link')) {
      col.fields.add(new URLField({ name: 'parallax_button_link' }))
    }

    app.save(col)

    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) {
        const rec = records[0]
        let changed = false

        if (!rec.getString('parallax_headline')) {
          rec.set('parallax_headline', 'Acredito que você pode mudar e eu posso te ajudar!')
          changed = true
        }
        if (!rec.getString('parallax_button_text')) {
          rec.set('parallax_button_text', 'Entre em Contato')
          changed = true
        }
        if (changed) app.save(rec)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('platform_settings')
      const fields = [
        'parallax_background_image',
        'parallax_headline',
        'parallax_button_text',
        'parallax_button_link',
      ]
      for (let i = 0; i < fields.length; i++) {
        try {
          col.fields.removeByName(fields[i])
        } catch (_) {}
      }
      app.save(col)
    } catch (_) {}
  },
)
