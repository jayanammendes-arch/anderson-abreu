migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (usersCol.fields.getByName('is_hypnosis')) {
      usersCol.fields.removeByName('is_hypnosis')
    }
    usersCol.removeIndex('idx_users_is_hypnosis')

    if (!usersCol.fields.getByName('level')) {
      usersCol.fields.add(
        new SelectField({
          name: 'level',
          values: ['Prata', 'Ouro', 'Diamante'],
          maxSelect: 1,
        }),
      )
    }
    app.save(usersCol)

    app
      .db()
      .newQuery("UPDATE users SET level = 'Prata' WHERE level = '' OR level IS NULL")
      .execute()

    var coursesCol = app.findCollectionByNameOrId('courses')
    if (!coursesCol.fields.getByName('level')) {
      coursesCol.fields.add(
        new SelectField({
          name: 'level',
          values: ['Prata', 'Ouro', 'Diamante', 'all'],
          maxSelect: 1,
        }),
      )
    }
    app.save(coursesCol)

    app
      .db()
      .newQuery("UPDATE courses SET level = 'all' WHERE level = '' OR level IS NULL")
      .execute()

    app.save(
      new Collection({
        name: 'pre_hypnosis_forms',
        type: 'base',
        listRule:
          "@request.auth.id != '' && (user = @request.auth.id || @request.auth.is_admin = true)",
        viewRule:
          "@request.auth.id != '' && (user = @request.auth.id || @request.auth.is_admin = true)",
        createRule: "@request.auth.id != '' && user = @request.auth.id",
        updateRule:
          "@request.auth.id != '' && (user = @request.auth.id || @request.auth.is_admin = true)",
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'responses', type: 'json', required: false },
          { name: 'completed', type: 'bool', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_pre_hypnosis_forms_user ON pre_hypnosis_forms (user)'],
      }),
    )

    var crmLeadsCol = app.findCollectionByNameOrId('crm_leads')
    if (!crmLeadsCol.fields.getByName('treatments')) {
      crmLeadsCol.fields.add(new JSONField({ name: 'treatments' }))
    }
    app.save(crmLeadsCol)
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('is_hypnosis')) {
      usersCol.fields.add(new BoolField({ name: 'is_hypnosis' }))
    }
    if (usersCol.fields.getByName('level')) {
      usersCol.fields.removeByName('level')
    }
    usersCol.addIndex('idx_users_is_hypnosis', false, 'is_hypnosis', '')
    app.save(usersCol)

    var coursesCol = app.findCollectionByNameOrId('courses')
    if (coursesCol.fields.getByName('level')) {
      coursesCol.fields.removeByName('level')
    }
    app.save(coursesCol)

    try {
      app.delete(app.findCollectionByNameOrId('pre_hypnosis_forms'))
    } catch (_) {}

    var crmLeadsCol = app.findCollectionByNameOrId('crm_leads')
    if (crmLeadsCol.fields.getByName('treatments')) {
      crmLeadsCol.fields.removeByName('treatments')
    }
    app.save(crmLeadsCol)
  },
)
