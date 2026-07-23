migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('agendar_background_image')) {
      col.fields.add(
        new FileField({
          name: 'agendar_background_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!col.fields.getByName('agendar_headline')) {
      col.fields.add(new TextField({ name: 'agendar_headline' }))
    }
    if (!col.fields.getByName('agendar_subheadline')) {
      col.fields.add(new TextField({ name: 'agendar_subheadline' }))
    }
    if (!col.fields.getByName('agendar_benefits')) {
      col.fields.add(new JSONField({ name: 'agendar_benefits', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('agendar_submit_button_text')) {
      col.fields.add(new TextField({ name: 'agendar_submit_button_text' }))
    }

    app.save(col)

    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) {
        const rec = records[0]
        let changed = false
        if (!rec.getString('agendar_headline')) {
          rec.set('agendar_headline', 'Agende sua Sessão')
          changed = true
        }
        if (!rec.getString('agendar_subheadline')) {
          rec.set('agendar_subheadline', 'Resultados em 2 Sessões')
          changed = true
        }
        if (!rec.getString('agendar_submit_button_text')) {
          rec.set('agendar_submit_button_text', 'Enviar')
          changed = true
        }
        if (!rec.getString('agendar_benefits')) {
          rec.set(
            'agendar_benefits',
            JSON.stringify([
              'Atendimento Presencial',
              'Atendimento Online',
              'Método Exclusivo',
              'Técnica Aprovada Cientificamente',
              'Sessões Individuais e Personalizadas',
              'Ambiente Seguro e Acolhedor',
            ]),
          )
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
        'agendar_background_image',
        'agendar_headline',
        'agendar_subheadline',
        'agendar_benefits',
        'agendar_submit_button_text',
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
