migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    // Flag that lets an administrator manually release the "Comece por Aqui"
    // onboarding module to a specific Ouro or Diamante student.
    // (Prata students already have access to it by default.)
    if (!usersCol.fields.getByName('comece_por_aqui_access')) {
      usersCol.fields.add(new BoolField({ name: 'comece_por_aqui_access' }))
    }
    app.save(usersCol)

    // Everyone starts without the flag enabled.
    app
      .db()
      .newQuery('UPDATE users SET comece_por_aqui_access = 0 WHERE comece_por_aqui_access IS NULL')
      .execute()

    // Strengthen the create rule so a self-signup cannot assign itself a level
    // or flip the "Comece por Aqui" release flag — only admins may do that.
    usersCol.createRule =
      '@request.auth.is_admin = true || ' +
      '(@request.body.is_admin != true && ' +
      '@request.body.comece_por_aqui_access != true && ' +
      "@request.body.level != 'Prata' && " +
      "@request.body.level != 'Ouro' && " +
      "@request.body.level != 'Diamante')"
    app.save(usersCol)
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (usersCol.fields.getByName('comece_por_aqui_access')) {
      usersCol.fields.remove('comece_por_aqui_access')
    }

    // Restore the original create rule from migration 0002/0005.
    usersCol.createRule = '(@request.body.is_admin != true) || (@request.auth.is_admin = true)'
    app.save(usersCol)
  },
)
