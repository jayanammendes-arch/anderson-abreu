migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('is_admin')) {
      usersCol.fields.add(new BoolField({ name: 'is_admin' }))
    }
    usersCol.listRule = 'id = @request.auth.id || @request.auth.is_admin = true'
    usersCol.viewRule = 'id = @request.auth.id || @request.auth.is_admin = true'
    usersCol.createRule = '(@request.body.is_admin != true) || (@request.auth.is_admin = true)'
    app.save(usersCol)

    try {
      const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'jayanammendes@gmail.com')
      adminUser.set('is_admin', true)
      app.save(adminUser)
    } catch (_) {}

    const coursesCol = app.findCollectionByNameOrId('courses')
    if (!coursesCol.fields.getByName('discount_percentage')) {
      coursesCol.fields.add(new NumberField({ name: 'discount_percentage' }))
    }
    if (!coursesCol.fields.getByName('visibility')) {
      coursesCol.fields.add(
        new SelectField({
          name: 'visibility',
          values: ['home', 'templates', 'both'],
          maxSelect: 1,
        }),
      )
    }
    coursesCol.createRule = '@request.auth.is_admin = true'
    coursesCol.updateRule = '@request.auth.is_admin = true'
    coursesCol.deleteRule = '@request.auth.is_admin = true'
    app.save(coursesCol)

    const modulesCol = app.findCollectionByNameOrId('modules')
    modulesCol.createRule = '@request.auth.is_admin = true'
    modulesCol.updateRule = '@request.auth.is_admin = true'
    modulesCol.deleteRule = '@request.auth.is_admin = true'
    app.save(modulesCol)

    const lessonsCol = app.findCollectionByNameOrId('lessons')
    lessonsCol.createRule = '@request.auth.is_admin = true'
    lessonsCol.updateRule = '@request.auth.is_admin = true'
    lessonsCol.deleteRule = '@request.auth.is_admin = true'
    app.save(lessonsCol)

    const userAccess = new Collection({
      name: 'user_access',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user = @request.auth.id || @request.auth.is_admin = true)",
      viewRule:
        "@request.auth.id != '' && (user = @request.auth.id || @request.auth.is_admin = true)",
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: coursesCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_user_access_user_course ON user_access (user, course)'],
    })
    app.save(userAccess)

    const platformSettings = new Collection({
      name: 'platform_settings',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        { name: 'company_name', type: 'text' },
        {
          name: 'logo',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'primary_color', type: 'text' },
        { name: 'landing_page_json', type: 'json', maxSize: 5242880 },
        {
          name: 'login_image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'login_text', type: 'text' },
        { name: 'login_gradient', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(platformSettings)

    try {
      app.findFirstRecordByData('platform_settings', 'company_name', 'Anderson Abreu')
    } catch (_) {
      const settings = new Record(platformSettings)
      settings.set('company_name', 'Anderson Abreu')
      settings.set('primary_color', '#0047AB')
      settings.set('login_text', 'Hipnose, inteligencia emocional e mentoria de alta performance')
      settings.set('login_gradient', 'from-blue-900 via-blue-950 to-black')
      app.save(settings)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('user_access'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('platform_settings'))
    } catch (_) {}
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      usersCol.fields.removeByName('is_admin')
    } catch (_) {}
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    usersCol.createRule = ''
    app.save(usersCol)
    const coursesCol = app.findCollectionByNameOrId('courses')
    try {
      coursesCol.fields.removeByName('discount_percentage')
    } catch (_) {}
    try {
      coursesCol.fields.removeByName('visibility')
    } catch (_) {}
    coursesCol.createRule = null
    coursesCol.updateRule = null
    coursesCol.deleteRule = null
    app.save(coursesCol)
    const modulesCol = app.findCollectionByNameOrId('modules')
    modulesCol.createRule = null
    modulesCol.updateRule = null
    modulesCol.deleteRule = null
    app.save(modulesCol)
    const lessonsCol = app.findCollectionByNameOrId('lessons')
    lessonsCol.createRule = null
    lessonsCol.updateRule = null
    lessonsCol.deleteRule = null
    app.save(lessonsCol)
  },
)
