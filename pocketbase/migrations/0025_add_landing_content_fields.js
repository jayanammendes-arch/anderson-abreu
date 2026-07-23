migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('services_title')) {
      col.fields.add(new TextField({ name: 'services_title' }))
    }
    if (!col.fields.getByName('services_subtitle')) {
      col.fields.add(new TextField({ name: 'services_subtitle' }))
    }
    if (!col.fields.getByName('services_items')) {
      col.fields.add(new JSONField({ name: 'services_items', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('courses_section_title')) {
      col.fields.add(new TextField({ name: 'courses_section_title' }))
    }
    if (!col.fields.getByName('courses_section_text')) {
      col.fields.add(new TextField({ name: 'courses_section_text' }))
    }
    if (!col.fields.getByName('courses_section_button')) {
      col.fields.add(new TextField({ name: 'courses_section_button' }))
    }

    app.save(col)

    try {
      var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) {
        var rec = records[0]
        var changed = false
        if (!rec.getString('services_title')) {
          rec.set('services_title', 'Soluções em Hipnoterapia')
          changed = true
        }
        if (!rec.getString('services_subtitle')) {
          rec.set('services_subtitle', 'Transforme sua vida com nossos serviços especializados')
          changed = true
        }
        if (!rec.get('services_items')) {
          rec.set(
            'services_items',
            JSON.stringify([
              {
                title: 'Hipnose Clínica',
                description:
                  'Tratamento de fobias, ansiedade, traumas e bloqueios emocionais através de técnicas comprovadas.',
                icon: 'brain',
              },
              {
                title: 'Inteligência Emocional',
                description:
                  'Desenvolvimento de autoconhecimento e gestão emocional para alta performance.',
                icon: 'heart',
              },
              {
                title: 'Mentoria de Performance',
                description:
                  'Acompanhamento personalizado para alcançar resultados extraordinários.',
                icon: 'target',
              },
              {
                title: 'Formação Profissional',
                description:
                  'Cursos com certificação reconhecida em hipnoterapia e desenvolvimento humano.',
                icon: 'graduation-cap',
              },
            ]),
          )
          changed = true
        }
        if (!rec.getString('courses_section_title')) {
          rec.set('courses_section_title', 'Cursos Disponíveis')
          changed = true
        }
        if (!rec.getString('courses_section_text')) {
          rec.set(
            'courses_section_text',
            'Conheça nossos cursos e formações em hipnoterapia e desenvolvimento humano.',
          )
          changed = true
        }
        if (!rec.getString('courses_section_button')) {
          rec.set('courses_section_button', 'Ver Cursos')
          changed = true
        }
        if (changed) app.save(rec)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('platform_settings')
      var fieldsToRemove = [
        'services_title',
        'services_subtitle',
        'services_items',
        'courses_section_title',
        'courses_section_text',
        'courses_section_button',
      ]
      for (var i = 0; i < fieldsToRemove.length; i++) {
        try {
          col.fields.removeByName(fieldsToRemove[i])
        } catch (_) {}
      }
      app.save(col)
    } catch (_) {}
  },
)
