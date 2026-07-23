migrate(
  (app) => {
    const collection = new Collection({
      name: 'site_faqs',
      type: 'base',
      listRule: 'is_active = true',
      viewRule: 'is_active = true',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'editor', required: true, maxSize: 5242880 },
        { name: 'order', type: 'number' },
        { name: 'is_active', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_site_faqs_order ON site_faqs (order)',
        'CREATE INDEX idx_site_faqs_active_order ON site_faqs (is_active, order)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('site_faqs'))
    } catch (_) {}
  },
)
