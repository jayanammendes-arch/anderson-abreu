migrate(
  (app) => {
    var usersId = '_pb_users_auth_'
    var coursesId = app.findCollectionByNameOrId('courses').id

    app.save(
      new Collection({
        name: 'crm_leads',
        type: 'base',
        listRule: '@request.auth.is_admin = true',
        viewRule: '@request.auth.is_admin = true',
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'text', required: true },
          { name: 'phone', type: 'text' },
          { name: 'instagram_handle', type: 'text' },
          {
            name: 'stage',
            type: 'select',
            required: true,
            values: [
              'Leads externos',
              'Novos Seguidores',
              'Base',
              'No Show',
              'Conexao',
              'Wtz ok Anderson',
              'Fechado',
            ],
            maxSelect: 1,
          },
          { name: 'notes', type: 'text' },
          {
            name: 'linked_user',
            type: 'relation',
            collectionId: usersId,
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_crm_leads_stage ON crm_leads (stage)',
          'CREATE INDEX idx_crm_leads_email ON crm_leads (email)',
        ],
      }),
    )

    var crmLeadsId = app.findCollectionByNameOrId('crm_leads').id

    app.save(
      new Collection({
        name: 'crm_interactions',
        type: 'base',
        listRule: '@request.auth.is_admin = true',
        viewRule: '@request.auth.is_admin = true',
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          {
            name: 'lead',
            type: 'relation',
            required: true,
            collectionId: crmLeadsId,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'user',
            type: 'relation',
            collectionId: usersId,
            maxSelect: 1,
          },
          { name: 'type', type: 'text' },
          { name: 'content', type: 'editor' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_crm_interactions_lead ON crm_interactions (lead)'],
      }),
    )

    app.save(
      new Collection({
        name: 'crm_purchases',
        type: 'base',
        listRule: '@request.auth.is_admin = true',
        viewRule: '@request.auth.is_admin = true',
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          {
            name: 'lead',
            type: 'relation',
            collectionId: crmLeadsId,
            maxSelect: 1,
          },
          {
            name: 'user',
            type: 'relation',
            collectionId: usersId,
            maxSelect: 1,
          },
          {
            name: 'course',
            type: 'relation',
            collectionId: coursesId,
            maxSelect: 1,
          },
          { name: 'mentorship_service', type: 'text' },
          { name: 'purchase_date', type: 'date' },
          { name: 'amount', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_crm_purchases_lead ON crm_purchases (lead)'],
      }),
    )
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('crm_purchases'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('crm_interactions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('crm_leads'))
    } catch (_) {}
  },
)
