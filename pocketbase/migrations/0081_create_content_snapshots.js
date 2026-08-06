migrate(
  (app) => {
    const treatmentCatId = app.findCollectionByNameOrId('treatment_categories').id
    const collection = new Collection({
      name: 'content_snapshots',
      type: 'base',
      listRule: '@request.auth.is_admin = true',
      viewRule: '@request.auth.is_admin = true',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        {
          name: 'record_id',
          type: 'relation',
          required: true,
          collectionId: treatmentCatId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'snapshot', type: 'json', required: true, maxSize: 5242880 },
        {
          name: 'user',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_content_snapshots_record ON content_snapshots (record_id)',
        'CREATE INDEX idx_content_snapshots_created ON content_snapshots (created DESC)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('content_snapshots'))
    } catch (_) {}
  },
)
