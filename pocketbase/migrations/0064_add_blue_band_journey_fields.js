migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('platform_settings')

    var backup = []
    try {
      var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1000, 0)
      for (var i = 0; i < records.length; i++) {
        backup.push({ id: records[i].id, val: records[i].getString('global_blue_band_text') })
      }
    } catch (_) {}

    if (col.fields.getByName('global_blue_band_text')) {
      col.fields.removeByName('global_blue_band_text')
    }
    app.save(col)

    col.fields.add(new EditorField({ name: 'global_blue_band_text', maxSize: 5242880 }))

    if (!col.fields.getByName('blue_band_phrase')) {
      col.fields.add(new EditorField({ name: 'blue_band_phrase', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('blue_band_whatsapp_text')) {
      col.fields.add(new TextField({ name: 'blue_band_whatsapp_text' }))
    }
    if (!col.fields.getByName('blue_band_whatsapp_enabled')) {
      col.fields.add(new BoolField({ name: 'blue_band_whatsapp_enabled' }))
    }
    if (!col.fields.getByName('journey_title')) {
      col.fields.add(new EditorField({ name: 'journey_title', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('journey_text')) {
      col.fields.add(new EditorField({ name: 'journey_text', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('journey_button_text')) {
      col.fields.add(new TextField({ name: 'journey_button_text' }))
    }
    if (!col.fields.getByName('journey_button_link')) {
      col.fields.add(new TextField({ name: 'journey_button_link' }))
    }
    if (!col.fields.getByName('journey_button_type')) {
      col.fields.add(
        new SelectField({
          name: 'journey_button_type',
          values: ['whatsapp', 'internal'],
          maxSelect: 1,
        }),
      )
    }
    app.save(col)

    for (var j = 0; j < backup.length; j++) {
      if (backup[j].val) {
        try {
          var rec = app.findFirstRecordByData('platform_settings', 'id', backup[j].id)
          rec.set('global_blue_band_text', backup[j].val)
          app.save(rec)
        } catch (_) {}
      }
    }

    try {
      var allRecords = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1000, 0)
      for (var k = 0; k < allRecords.length; k++) {
        var r = allRecords[k]
        var changed = false
        if (!r.getString('blue_band_whatsapp_text')) {
          r.set('blue_band_whatsapp_text', 'Fale Conosco')
          changed = true
        }
        if (!r.getString('journey_button_text')) {
          r.set('journey_button_text', 'Agendar Sessão')
          changed = true
        }
        if (!r.getString('journey_button_type')) {
          r.set('journey_button_type', 'internal')
          changed = true
        }
        if (!r.getString('journey_button_link')) {
          r.set('journey_button_link', '/agendar')
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
    var col = app.findCollectionByNameOrId('platform_settings')

    var newFields = [
      'blue_band_phrase',
      'blue_band_whatsapp_text',
      'blue_band_whatsapp_enabled',
      'journey_title',
      'journey_text',
      'journey_button_text',
      'journey_button_link',
      'journey_button_type',
    ]
    for (var i = 0; i < newFields.length; i++) {
      if (col.fields.getByName(newFields[i])) {
        col.fields.removeByName(newFields[i])
      }
    }

    if (col.fields.getByName('global_blue_band_text')) {
      col.fields.removeByName('global_blue_band_text')
    }
    col.fields.add(new TextField({ name: 'global_blue_band_text' }))
    app.save(col)
  },
)
