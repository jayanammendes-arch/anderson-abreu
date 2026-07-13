migrate(
  (app) => {
    var lessonsCol = app.findCollectionByNameOrId('lessons')
    if (!lessonsCol.fields.getByName('duration_minutes')) {
      lessonsCol.fields.add(new NumberField({ name: 'duration_minutes' }))
    }
    app.save(lessonsCol)

    var coursesCol = app.findCollectionByNameOrId('courses')
    if (!coursesCol.fields.getByName('instructor_name')) {
      coursesCol.fields.add(new TextField({ name: 'instructor_name' }))
    }
    if (!coursesCol.fields.getByName('manual_workload')) {
      coursesCol.fields.add(new NumberField({ name: 'manual_workload' }))
    }
    app.save(coursesCol)

    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    app.save(
      new Collection({
        name: 'certificates',
        type: 'base',
        listRule: "@request.auth.id != '' && user = @request.auth.id",
        viewRule: "@request.auth.id != '' && user = @request.auth.id",
        createRule: "@request.auth.id != ''",
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'course',
            type: 'relation',
            required: true,
            collectionId: coursesCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'issue_date', type: 'date', required: false },
          { name: 'workload_at_issue', type: 'number', required: false },
          { name: 'instructor_at_issue', type: 'text', required: false },
          {
            name: 'certificate_file',
            type: 'file',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['application/pdf'],
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_certificates_user ON certificates (user)',
          'CREATE INDEX idx_certificates_course ON certificates (course)',
        ],
      }),
    )
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('certificates'))
    } catch (_) {}

    var lessonsCol = app.findCollectionByNameOrId('lessons')
    var dm = lessonsCol.fields.getByName('duration_minutes')
    if (dm) lessonsCol.fields.remove(dm.getId())
    app.save(lessonsCol)

    var coursesCol = app.findCollectionByNameOrId('courses')
    var inField = coursesCol.fields.getByName('instructor_name')
    if (inField) coursesCol.fields.remove(inField.getId())
    var mwField = coursesCol.fields.getByName('manual_workload')
    if (mwField) coursesCol.fields.remove(mwField.getId())
    app.save(coursesCol)
  },
)
