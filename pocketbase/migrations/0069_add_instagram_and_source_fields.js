migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('users')
    if (!usersCol.fields.getByName('instagram_handle')) {
      usersCol.fields.add(new TextField({ name: 'instagram_handle' }))
    }
    app.save(usersCol)

    var crmCol = app.findCollectionByNameOrId('crm_leads')
    if (!crmCol.fields.getByName('source')) {
      crmCol.fields.add(
        new SelectField({
          name: 'source',
          values: ['site', 'social'],
          maxSelect: 1,
        }),
      )
      app.save(crmCol)

      app
        .db()
        .newQuery("UPDATE crm_leads SET source = 'social' WHERE source IS NULL OR source = ''")
        .execute()
    }

    crmCol.addIndex('idx_crm_leads_source', false, 'source', '')
    crmCol.addIndex('idx_crm_leads_linked_user', false, 'linked_user', '')
    app.save(crmCol)
  },
  (app) => {
    try {
      var crmCol = app.findCollectionByNameOrId('crm_leads')
      crmCol.removeIndex('idx_crm_leads_source')
      crmCol.removeIndex('idx_crm_leads_linked_user')
      var sourceField = crmCol.fields.getByName('source')
      if (sourceField) crmCol.fields.remove(sourceField)
      app.save(crmCol)
    } catch (_) {}

    try {
      var usersCol = app.findCollectionByNameOrId('users')
      var igField = usersCol.fields.getByName('instagram_handle')
      if (igField) usersCol.fields.remove(igField)
      app.save(usersCol)
    } catch (_) {}
  },
)
