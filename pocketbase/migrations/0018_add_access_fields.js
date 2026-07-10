migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('is_patient')) {
      usersCol.fields.add(new BoolField({ name: 'is_patient' }))
    }
    app.save(usersCol)

    var coursesCol = app.findCollectionByNameOrId('courses')
    if (!coursesCol.fields.getByName('access_type')) {
      coursesCol.fields.add(
        new SelectField({
          name: 'access_type',
          values: ['free', 'paid', 'patient'],
          maxSelect: 1,
        }),
      )
    }
    app.save(coursesCol)

    var lessonsCol = app.findCollectionByNameOrId('lessons')
    if (!lessonsCol.fields.getByName('is_live')) {
      lessonsCol.fields.add(new BoolField({ name: 'is_live' }))
    }
    app.save(lessonsCol)
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (usersCol.fields.getByName('is_patient')) {
      usersCol.fields.remove('is_patient')
    }
    app.save(usersCol)

    var coursesCol = app.findCollectionByNameOrId('courses')
    if (coursesCol.fields.getByName('access_type')) {
      coursesCol.fields.remove('access_type')
    }
    app.save(coursesCol)

    var lessonsCol = app.findCollectionByNameOrId('lessons')
    if (lessonsCol.fields.getByName('is_live')) {
      lessonsCol.fields.remove('is_live')
    }
    app.save(lessonsCol)
  },
)
