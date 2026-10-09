migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. Add optional CPF field
    if (!usersCol.fields.getByName('cpf')) {
      usersCol.fields.add(
        new TextField({
          name: 'cpf',
          required: false,
        }),
      )
    }

    // 2. Ensure admin can delete users via API if needed
    // Current deleteRule was: "id = @request.auth.id"
    usersCol.deleteRule = '@request.auth.is_admin = true || id = @request.auth.id'
    app.save(usersCol)

    // 3. Ensure pre_hypnosis_forms can be deleted by admin (for reset and cleanup)
    try {
      var preHypCol = app.findCollectionByNameOrId('pre_hypnosis_forms')
      preHypCol.deleteRule = '@request.auth.is_admin = true || @request.auth.id = user'
      app.save(preHypCol)
    } catch (_) {}
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (usersCol.fields.getByName('cpf')) {
      usersCol.fields.removeByName('cpf')
    }
    usersCol.deleteRule = 'id = @request.auth.id'
    app.save(usersCol)

    try {
      var preHypCol = app.findCollectionByNameOrId('pre_hypnosis_forms')
      preHypCol.deleteRule = null
      app.save(preHypCol)
    } catch (_) {}
  },
)
