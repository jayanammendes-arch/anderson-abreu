migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('is_hypnosis')) {
      usersCol.fields.add(new BoolField({ name: 'is_hypnosis' }))
    }
    app.save(usersCol)

    app.db().newQuery('UPDATE users SET is_hypnosis = 1 WHERE is_patient = 1').execute()

    app
      .db()
      .newQuery("UPDATE courses SET access_type = 'hypnosis' WHERE access_type = 'patient'")
      .execute()

    var coursesCol = app.findCollectionByNameOrId('courses')
    if (coursesCol.fields.getByName('access_type')) {
      coursesCol.fields.removeByName('access_type')
    }
    coursesCol.fields.add(
      new SelectField({
        name: 'access_type',
        values: ['free', 'paid', 'hypnosis'],
        maxSelect: 1,
      }),
    )
    app.save(coursesCol)

    usersCol.addIndex('idx_users_is_hypnosis', false, 'is_hypnosis', '')
    app.save(usersCol)

    coursesCol.addIndex('idx_courses_access_type', false, 'access_type', '')
    app.save(coursesCol)
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (usersCol.fields.getByName('is_hypnosis')) {
      usersCol.fields.removeByName('is_hypnosis')
    }
    usersCol.removeIndex('idx_users_is_hypnosis')
    app.save(usersCol)

    app
      .db()
      .newQuery("UPDATE courses SET access_type = 'patient' WHERE access_type = 'hypnosis'")
      .execute()

    var coursesCol = app.findCollectionByNameOrId('courses')
    if (coursesCol.fields.getByName('access_type')) {
      coursesCol.fields.removeByName('access_type')
    }
    coursesCol.fields.add(
      new SelectField({
        name: 'access_type',
        values: ['free', 'paid', 'patient'],
        maxSelect: 1,
      }),
    )
    coursesCol.removeIndex('idx_courses_access_type')
    app.save(coursesCol)
  },
)
