migrate(
  (app) => {
    // 1. Criar coleção instagram_posts
    const collection = new Collection({
      name: 'instagram_posts',
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
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          required: false,
        },
        {
          name: 'post_url',
          type: 'url',
          required: true,
        },
        {
          name: 'order',
          type: 'number',
          required: false,
        },
        {
          name: 'is_active',
          type: 'bool',
          required: false,
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE INDEX idx_instagram_posts_order ON instagram_posts (order)',
        'CREATE INDEX idx_instagram_posts_active ON instagram_posts (is_active)',
      ],
    })
    app.save(collection)

    // 2. Adicionar campo instagram_url em platform_settings se não existir
    try {
      const settingsCol = app.findCollectionByNameOrId('platform_settings')
      if (!settingsCol.fields.getByName('instagram_url')) {
        settingsCol.fields.add(
          new URLField({
            name: 'instagram_url',
            required: false,
          }),
        )
        app.save(settingsCol)
      }
    } catch (e) {
      console.log('Erro ao atualizar platform_settings:', e)
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('instagram_posts')
      app.delete(collection)
    } catch (_) {}

    try {
      const settingsCol = app.findCollectionByNameOrId('platform_settings')
      const field = settingsCol.fields.getByName('instagram_url')
      if (field) {
        settingsCol.fields.removeByName('instagram_url')
        app.save(settingsCol)
      }
    } catch (_) {}
  },
)
