migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('home_credential_name')) {
      col.fields.add(new TextField({ name: 'home_credential_name', required: true }))
    }
    if (!col.fields.getByName('home_credential_subtitle')) {
      col.fields.add(new TextField({ name: 'home_credential_subtitle' }))
    }
    if (!col.fields.getByName('home_credential_image')) {
      col.fields.add(
        new FileField({
          name: 'home_credential_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!col.fields.getByName('home_credential_list')) {
      col.fields.add(new JSONField({ name: 'home_credential_list', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('home_credential_cta_text')) {
      col.fields.add(new TextField({ name: 'home_credential_cta_text' }))
    }
    if (!col.fields.getByName('home_credential_floating_badge_text')) {
      col.fields.add(new TextField({ name: 'home_credential_floating_badge_text' }))
    }

    app.save(col)

    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) {
        const rec = records[0]
        let changed = false

        if (!rec.getString('home_credential_name')) {
          rec.set('home_credential_name', 'Anderson Abreu')
          changed = true
        }
        if (!rec.getString('home_credential_subtitle')) {
          rec.set('home_credential_subtitle', 'Hipnoterapeuta e Professor de Hipnose')
          changed = true
        }
        if (!rec.getString('home_credential_cta_text')) {
          rec.set('home_credential_cta_text', 'Conheça Mais')
          changed = true
        }
        if (!rec.getString('home_credential_floating_badge_text')) {
          rec.set('home_credential_floating_badge_text', '+8 Certificações Internacionais')
          changed = true
        }
        if (!rec.getString('home_credential_list')) {
          rec.set(
            'home_credential_list',
            JSON.stringify([
              'Hipnose Clínica Avançada',
              'Pós-graduação em Terapias Cognitivo-Comportamentais',
              'Certificação Internacional em Hipnose Ericksoniana',
              'Membro da Sociedade Brasileira de Hipnose',
              'Mais de 10.000 atendimentos realizados',
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
        'home_credential_name',
        'home_credential_subtitle',
        'home_credential_image',
        'home_credential_list',
        'home_credential_cta_text',
        'home_credential_floating_badge_text',
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
