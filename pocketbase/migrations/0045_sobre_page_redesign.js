migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    var textFields = [
      'about_hero_title',
      'about_hero_subtitle',
      'about_journey_title',
      'about_formations_title',
      'about_grand_names_title',
      'about_media_title',
      'about_recommendations_title',
      'about_environment_title',
      'about_cta_title',
      'about_cta_subtitle',
      'about_cta_button_text',
      'about_cta_button_link',
    ]
    var boolFields = [
      'about_hero_visible',
      'about_credentials_visible',
      'about_journey_visible',
      'about_formations_visible',
      'about_grand_names_visible',
      'about_media_visible',
      'about_recommendations_visible',
      'about_environment_visible',
      'about_cta_visible',
    ]
    var fileFields = [
      'about_hero_image',
      'about_journey_photo',
      'about_formations_image',
      'about_cta_background_image',
    ]

    for (var i = 0; i < textFields.length; i++) {
      if (!col.fields.getByName(textFields[i])) {
        col.fields.add(new TextField({ name: textFields[i] }))
      }
    }
    for (var j = 0; j < boolFields.length; j++) {
      if (!col.fields.getByName(boolFields[j])) {
        col.fields.add(new BoolField({ name: boolFields[j] }))
      }
    }
    for (var k = 0; k < fileFields.length; k++) {
      if (!col.fields.getByName(fileFields[k])) {
        col.fields.add(
          new FileField({
            name: fileFields[k],
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          }),
        )
      }
    }
    if (!col.fields.getByName('about_formations_list')) {
      col.fields.add(new JSONField({ name: 'about_formations_list', maxSize: 5242880 }))
    }
    app.save(col)

    app.save(
      new Collection({
        name: 'about_grand_names',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          {
            name: 'image',
            type: 'file',
            required: true,
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'order', type: 'number', onlyInt: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_about_grand_names_order ON about_grand_names (order)'],
      }),
    )

    app.save(
      new Collection({
        name: 'about_media_mentions',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'link', type: 'url' },
          {
            name: 'image',
            type: 'file',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'order', type: 'number', onlyInt: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_about_media_mentions_order ON about_media_mentions (order)'],
      }),
    )

    app.save(
      new Collection({
        name: 'about_recommendations',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          { name: 'video_url', type: 'url', required: true },
          { name: 'description', type: 'text' },
          { name: 'order', type: 'number', onlyInt: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_about_recommendations_order ON about_recommendations (order)'],
      }),
    )

    app.save(
      new Collection({
        name: 'about_environment_images',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          {
            name: 'image',
            type: 'file',
            required: true,
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'order', type: 'number', onlyInt: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_about_environment_images_order ON about_environment_images (order)',
        ],
      }),
    )

    try {
      var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) {
        var rec = records[0]
        if (!rec.getString('about_hero_title')) {
          rec.set('about_hero_title', 'Anderson Abreu')
          rec.set('about_hero_subtitle', 'Referência Nacional em Hipnoterapia')
          rec.set('about_hero_visible', true)
          rec.set('about_credentials_visible', true)
          rec.set('about_journey_title', 'Jornada de Sucesso')
          rec.set('about_journey_visible', true)
          rec.set('about_formations_title', 'Formações')
          rec.set(
            'about_formations_list',
            JSON.stringify([
              'Hipnose Clínica Avançada',
              'PNL - Programação Neurolinguística',
              'Terapias Cognitivo-Comportamentais',
              'Regressão de Memória',
              'Hipnose Eriksoniana',
              'PNL Aplicada à Hipnose',
            ]),
          )
          rec.set('about_formations_visible', true)
          rec.set('about_grand_names_title', 'Com Grandes Nomes da Hipnoterapia')
          rec.set('about_grand_names_visible', true)
          rec.set('about_media_title', 'Na Mídia')
          rec.set('about_media_visible', true)
          rec.set('about_recommendations_title', 'Quem Recomenda')
          rec.set('about_recommendations_visible', true)
          rec.set('about_environment_title', 'Nosso Ambiente')
          rec.set('about_environment_visible', true)
          rec.set('about_cta_title', 'Pronto para transformar sua vida?')
          rec.set(
            'about_cta_subtitle',
            'Agende sua sessão e dê o primeiro passo rumo ao bem-estar.',
          )
          rec.set('about_cta_button_text', 'Agende sua sessão')
          rec.set('about_cta_button_link', '/agendar')
          rec.set('about_cta_visible', true)
          app.save(rec)
        }
      }
    } catch (_) {}
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('platform_settings')
      var fieldsToRemove = [
        'about_hero_image',
        'about_hero_title',
        'about_hero_subtitle',
        'about_hero_visible',
        'about_credentials_visible',
        'about_journey_title',
        'about_journey_photo',
        'about_journey_visible',
        'about_formations_title',
        'about_formations_list',
        'about_formations_image',
        'about_formations_visible',
        'about_grand_names_title',
        'about_grand_names_visible',
        'about_media_title',
        'about_media_visible',
        'about_recommendations_title',
        'about_recommendations_visible',
        'about_environment_title',
        'about_environment_visible',
        'about_cta_title',
        'about_cta_subtitle',
        'about_cta_button_text',
        'about_cta_button_link',
        'about_cta_background_image',
        'about_cta_visible',
      ]
      for (var i = 0; i < fieldsToRemove.length; i++) {
        try {
          col.fields.removeByName(fieldsToRemove[i])
        } catch (_) {}
      }
      app.save(col)
    } catch (_) {}

    var cols = [
      'about_grand_names',
      'about_media_mentions',
      'about_recommendations',
      'about_environment_images',
    ]
    for (var j = 0; j < cols.length; j++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[j]))
      } catch (_) {}
    }
  },
)
