migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('hero_title')) {
      col.fields.add(new TextField({ name: 'hero_title' }))
    }
    if (!col.fields.getByName('hero_subtitle')) {
      col.fields.add(new TextField({ name: 'hero_subtitle' }))
    }
    if (!col.fields.getByName('hero_cta_text')) {
      col.fields.add(new TextField({ name: 'hero_cta_text' }))
    }
    if (!col.fields.getByName('about_title')) {
      col.fields.add(new TextField({ name: 'about_title' }))
    }
    if (!col.fields.getByName('stats_students')) {
      col.fields.add(new NumberField({ name: 'stats_students' }))
    }
    if (!col.fields.getByName('stats_years')) {
      col.fields.add(new NumberField({ name: 'stats_years' }))
    }
    if (!col.fields.getByName('stats_courses')) {
      col.fields.add(new NumberField({ name: 'stats_courses' }))
    }
    if (!col.fields.getByName('stats_countries')) {
      col.fields.add(new NumberField({ name: 'stats_countries' }))
    }
    if (!col.fields.getByName('testimonials_active')) {
      col.fields.add(new BoolField({ name: 'testimonials_active' }))
    }
    if (!col.fields.getByName('agenda_intro')) {
      col.fields.add(new TextField({ name: 'agenda_intro' }))
    }
    if (!col.fields.getByName('agenda_image')) {
      col.fields.add(
        new FileField({
          name: 'agenda_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!col.fields.getByName('courses_title')) {
      col.fields.add(new TextField({ name: 'courses_title' }))
    }
    if (!col.fields.getByName('courses_intro')) {
      col.fields.add(new TextField({ name: 'courses_intro' }))
    }
    if (!col.fields.getByName('contact_title')) {
      col.fields.add(new TextField({ name: 'contact_title' }))
    }
    if (!col.fields.getByName('contact_intro')) {
      col.fields.add(new TextField({ name: 'contact_intro' }))
    }
    if (!col.fields.getByName('contact_phone')) {
      col.fields.add(new TextField({ name: 'contact_phone' }))
    }

    app.save(col)

    try {
      var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) {
        var rec = records[0]
        var changed = false
        if (!rec.getString('hero_title')) {
          rec.set('hero_title', 'Transforme sua mente.')
          changed = true
        }
        if (!rec.getString('hero_subtitle')) {
          rec.set(
            'hero_subtitle',
            'Hipnose clínica, inteligência emocional e mentoria de alta performance para quem deseja romper limites, superar bloqueios e alcançar resultados extraordinários na vida pessoal e profissional.',
          )
          changed = true
        }
        if (!rec.getString('hero_cta_text')) {
          rec.set('hero_cta_text', 'Conheça nossos cursos')
          changed = true
        }
        if (!rec.getString('about_title')) {
          rec.set('about_title', 'Muito além da teoria. Uma imersão na prática.')
          changed = true
        }
        if (!rec.get('stats_students')) {
          rec.set('stats_students', 5000)
          changed = true
        }
        if (!rec.get('stats_years')) {
          rec.set('stats_years', 10)
          changed = true
        }
        if (!rec.get('stats_courses')) {
          rec.set('stats_courses', 7)
          changed = true
        }
        if (!rec.get('stats_countries')) {
          rec.set('stats_countries', 7)
          changed = true
        }
        if (!rec.get('testimonials_active')) {
          rec.set('testimonials_active', true)
          changed = true
        }
        if (!rec.getString('agenda_intro')) {
          rec.set(
            'agenda_intro',
            'Participe de nossos eventos presenciais e online. Garanta sua vaga com antecedência.',
          )
          changed = true
        }
        if (!rec.getString('courses_title')) {
          rec.set('courses_title', 'Cursos Online')
          changed = true
        }
        if (!rec.getString('courses_intro')) {
          rec.set(
            'courses_intro',
            'Aprenda no seu ritmo, com metodologia comprovada e acesso imediato.',
          )
          changed = true
        }
        if (!rec.getString('contact_title')) {
          rec.set('contact_title', 'Dê o primeiro passo.')
          changed = true
        }
        if (!rec.getString('contact_intro')) {
          rec.set(
            'contact_intro',
            'Estamos prontos para tirar suas dúvidas e orientar você na melhor escolha para sua carreira e desenvolvimento pessoal.',
          )
          changed = true
        }
        if (!rec.getString('contact_phone')) {
          rec.set('contact_phone', '+55 (11) 99999-9999')
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
        'hero_title',
        'hero_subtitle',
        'hero_cta_text',
        'about_title',
        'stats_students',
        'stats_years',
        'stats_courses',
        'stats_countries',
        'testimonials_active',
        'agenda_intro',
        'agenda_image',
        'courses_title',
        'courses_intro',
        'contact_title',
        'contact_intro',
        'contact_phone',
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
