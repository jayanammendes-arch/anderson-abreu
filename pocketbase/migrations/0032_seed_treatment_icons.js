migrate(
  (app) => {
    var iconMap = {
      ansiedade: { icon: 'brain', category: 'Doenças Mentais' },
      depressao: { icon: 'heart', category: 'Doenças Emocionais' },
      'dor-cronica': { icon: 'activity', category: 'Doenças Corporais' },
      fobias: { icon: 'eye', category: 'Doenças Mentais' },
      insonia: { icon: 'moon', category: 'Doenças Mentais' },
      traumas: { icon: 'heart-handshake', category: 'Doenças Emocionais' },
      tabagismo: { icon: 'zap', category: 'Doenças Corporais' },
      estresse: { icon: 'flower', category: 'Doenças Emocionais' },
      autoestima: { icon: 'smile', category: 'Doenças Emocionais' },
      panico: { icon: 'cloud', category: 'Doenças Mentais' },
      compulsao: { icon: 'shield', category: 'Doenças Mentais' },
      'bem-estar': { icon: 'sparkles', category: 'Doenças Emocionais' },
    }

    var col = app.findCollectionByNameOrId('treatments')

    for (var slug in iconMap) {
      var data = iconMap[slug]
      var existing = null
      try {
        existing = app.findFirstRecordByData('treatments', 'slug', slug)
      } catch (_) {}

      if (existing) {
        existing.set('icon', data.icon)
        existing.set('category', data.category)
        app.save(existing)
      } else {
        var rec = new Record(col)
        rec.set('name', slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '))
        rec.set('slug', slug)
        rec.set('detailed_content', '<p>Conteúdo detalhado em breve.</p>')
        rec.set('icon', data.icon)
        rec.set('category', data.category)
        app.save(rec)
      }
    }
  },
  (app) => {},
)
