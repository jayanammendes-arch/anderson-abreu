migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('mentorship_title')) {
      col.fields.add(new TextField({ name: 'mentorship_title' }))
    }
    if (!col.fields.getByName('mentorship_subtitle')) {
      col.fields.add(new TextField({ name: 'mentorship_subtitle' }))
    }
    if (!col.fields.getByName('mentorship_description')) {
      col.fields.add(new EditorField({ name: 'mentorship_description', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('mentorship_benefits')) {
      col.fields.add(new JSONField({ name: 'mentorship_benefits', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('mentorship_button_text')) {
      col.fields.add(new TextField({ name: 'mentorship_button_text' }))
    }
    if (!col.fields.getByName('mentorship_whatsapp_number')) {
      col.fields.add(new TextField({ name: 'mentorship_whatsapp_number' }))
    }

    app.save(col)

    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) {
        const rec = records[0]
        let changed = false

        if (!rec.getString('mentorship_title')) {
          rec.set('mentorship_title', 'Mentoria de Alta Performance')
          changed = true
        }
        if (!rec.getString('mentorship_subtitle')) {
          rec.set('mentorship_subtitle', 'Transforme sua vida e alcance resultados extraordinários')
          changed = true
        }
        if (!rec.getString('mentorship_description')) {
          rec.set(
            'mentorship_description',
            '<p>A mentoria de alta performance é um programa exclusivo desenvolvido para pessoas que buscam superar limites, alcançar objetivos extraordinários e viver com propósito. Com uma abordagem personalizada, combinamos técnicas avançadas de desenvolvimento humano, inteligência emocional e estratégias de alta performance para potencializar seus resultados em todas as áreas da vida.</p><p>Este programa é ideal para empreendedores, líderes, atletas e profissionais que desejam elevar seu padrão de excelência e construir uma vida de realização e impacto.</p>',
          )
          changed = true
        }
        if (!rec.getString('mentorship_benefits')) {
          rec.set(
            'mentorship_benefits',
            JSON.stringify([
              'Acompanhamento personalizado e individual',
              'Estratégias exclusivas de alta performance',
              'Desenvolvimento de inteligência emocional',
              'Planos de ação sob medida para seus objetivos',
              'Acesso direto e suporte contínuo',
              'Resultados mensuráveis e acompanhamento de progresso',
            ]),
          )
          changed = true
        }
        if (!rec.getString('mentorship_button_text')) {
          rec.set('mentorship_button_text', 'Falar sobre a Mentoria')
          changed = true
        }
        if (!rec.getString('mentorship_whatsapp_number')) {
          rec.set('mentorship_whatsapp_number', '')
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
        'mentorship_title',
        'mentorship_subtitle',
        'mentorship_description',
        'mentorship_benefits',
        'mentorship_button_text',
        'mentorship_whatsapp_number',
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
