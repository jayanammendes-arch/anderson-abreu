migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('saiba_mais_text')) {
      col.fields.add(new TextField({ name: 'saiba_mais_text' }))
    }
    if (!col.fields.getByName('agendar_sessao_text')) {
      col.fields.add(new TextField({ name: 'agendar_sessao_text' }))
    }
    if (!col.fields.getByName('treatments_section_title')) {
      col.fields.add(new TextField({ name: 'treatments_section_title' }))
    }
    if (!col.fields.getByName('blog_section_title')) {
      col.fields.add(new TextField({ name: 'blog_section_title' }))
    }
    if (!col.fields.getByName('testimonials_section_title')) {
      col.fields.add(new TextField({ name: 'testimonials_section_title' }))
    }
    if (!col.fields.getByName('about_intro')) {
      col.fields.add(new TextField({ name: 'about_intro' }))
    }
    if (!col.fields.getByName('about_full_bio')) {
      col.fields.add(new EditorField({ name: 'about_full_bio', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('about_credentials')) {
      col.fields.add(new TextField({ name: 'about_credentials' }))
    }
    if (!col.fields.getByName('about_page_image')) {
      col.fields.add(
        new FileField({
          name: 'about_page_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!col.fields.getByName('blog_section_intro')) {
      col.fields.add(new TextField({ name: 'blog_section_intro' }))
    }
    if (!col.fields.getByName('treatments_section_intro')) {
      col.fields.add(new TextField({ name: 'treatments_section_intro' }))
    }

    app.save(col)

    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) {
        const rec = records[0]
        let changed = false
        if (!rec.getString('saiba_mais_text')) {
          rec.set('saiba_mais_text', 'Saiba mais')
          changed = true
        }
        if (!rec.getString('agendar_sessao_text')) {
          rec.set('agendar_sessao_text', 'Agendar Sessão')
          changed = true
        }
        if (!rec.getString('treatments_section_title')) {
          rec.set('treatments_section_title', 'O que podemos tratar')
          changed = true
        }
        if (!rec.getString('blog_section_title')) {
          rec.set('blog_section_title', 'Blog')
          changed = true
        }
        if (!rec.getString('testimonials_section_title')) {
          rec.set('testimonials_section_title', 'Depoimentos')
          changed = true
        }
        if (!rec.getString('about_intro')) {
          rec.set(
            'about_intro',
            'Especialista em hipnose clínica e desenvolvimento humano, com mais de uma década transformando vidas.',
          )
          changed = true
        }
        if (!rec.getString('about_credentials')) {
          rec.set(
            'about_credentials',
            'Certificado em Hipnose Clínica • Pós-graduado em Psicologia Positiva • Membro da Sociedade Brasileira de Hipnose',
          )
          changed = true
        }
        if (!rec.getString('blog_section_intro')) {
          rec.set(
            'blog_section_intro',
            'Reflexões, técnicas e histórias sobre hipnose, inteligência emocional e desenvolvimento humano.',
          )
          changed = true
        }
        if (!rec.getString('treatments_section_intro')) {
          rec.set(
            'treatments_section_intro',
            'Tratamentos especializados para diversos quadros emocionais e comportamentais.',
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
        'saiba_mais_text',
        'agendar_sessao_text',
        'treatments_section_title',
        'blog_section_title',
        'testimonials_section_title',
        'about_intro',
        'about_full_bio',
        'about_credentials',
        'about_page_image',
        'blog_section_intro',
        'treatments_section_intro',
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
