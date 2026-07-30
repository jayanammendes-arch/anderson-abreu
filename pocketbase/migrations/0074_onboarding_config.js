migrate(
  (app) => {
    var collection = new Collection({
      name: 'onboarding_config',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: null,
      fields: [
        {
          name: 'cover_image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png'],
        },
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'text' },
        { name: 'steps', type: 'json' },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)

    var col = app.findCollectionByNameOrId('onboarding_config')
    var record = new Record(col)
    record.set('title', 'Comece por Aqui')
    record.set('subtitle', 'Sua jornada de transformação começa aqui')
    record.set('is_active', true)
    record.set('steps', [
      { type: 'form', label: 'Formulário Pré-Hipnose' },
      { type: 'life_wheel', label: 'Roda da Vida' },
      { type: 'lesson', label: 'Primeira Aula' },
      { type: 'audio', label: 'Primeiro Áudio' },
    ])
    app.save(record)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('onboarding_config'))
    } catch (_) {}
  },
)
