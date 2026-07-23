migrate(
  (app) => {
    const treatments = new Collection({
      name: 'treatments',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'short_description', type: 'text', required: false },
        { name: 'detailed_content', type: 'editor', required: true, maxSize: 5242880 },
        {
          name: 'image',
          type: 'file',
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'order', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_treatments_slug ON treatments (slug)',
        'CREATE INDEX idx_treatments_name ON treatments (name)',
      ],
    })
    app.save(treatments)

    const blogPosts = new Collection({
      name: 'blog_posts',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'excerpt', type: 'text', required: false },
        { name: 'content', type: 'editor', required: true, maxSize: 5242880 },
        {
          name: 'image',
          type: 'file',
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'author', type: 'text', required: false },
        { name: 'published_at', type: 'autodate', onCreate: true, onUpdate: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_blog_posts_slug ON blog_posts (slug)',
        'CREATE INDEX idx_blog_posts_published ON blog_posts (published_at DESC)',
      ],
    })
    app.save(blogPosts)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('treatments'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('blog_posts'))
    } catch (_) {}
  },
)
