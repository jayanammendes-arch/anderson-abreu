migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('faixa_azul_image')) {
      col.fields.add(
        new FileField({
          name: 'faixa_azul_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        }),
      )
    }
    if (!col.fields.getByName('faixa_azul_whatsapp_enabled')) {
      col.fields.add(new BoolField({ name: 'faixa_azul_whatsapp_enabled' }))
    }
    if (!col.fields.getByName('faixa_azul_whatsapp_text')) {
      col.fields.add(new TextField({ name: 'faixa_azul_whatsapp_text' }))
    }

    app.save(col)

    try {
      var records = app.findRecordsByFilter('treatment_categories', "id != ''", '-created', 1000, 0)
      for (var i = 0; i < records.length; i++) {
        var r = records[i]
        var changed = false
        if (!r.get('faixa_azul_whatsapp_enabled')) {
          r.set('faixa_azul_whatsapp_enabled', false)
          changed = true
        }
        if (!r.getString('faixa_azul_whatsapp_text')) {
          r.set('faixa_azul_whatsapp_text', 'Fale Conosco')
          changed = true
        }
        if (changed) {
          try {
            app.save(r)
          } catch (_) {}
        }
      }
    } catch (_) {}
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    var newFields = ['faixa_azul_image', 'faixa_azul_whatsapp_enabled', 'faixa_azul_whatsapp_text']
    for (var i = 0; i < newFields.length; i++) {
      if (col.fields.getByName(newFields[i])) {
        col.fields.removeByName(newFields[i])
      }
    }
    app.save(col)
  },
)
