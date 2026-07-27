migrate(
  (app) => {
    var categories = new Collection({
      name: 'life_wheel_categories',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'icon', type: 'text' },
        { name: 'color', type: 'text' },
        { name: 'order', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_life_wheel_categories_name ON life_wheel_categories (name)',
        'CREATE INDEX idx_life_wheel_categories_order ON life_wheel_categories (order)',
      ],
    })
    app.save(categories)

    var catId = app.findCollectionByNameOrId('life_wheel_categories').id
    var questions = new Collection({
      name: 'life_wheel_questions',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        { name: 'text', type: 'text', required: true },
        { name: 'explanation', type: 'text' },
        {
          name: 'category',
          type: 'relation',
          required: true,
          collectionId: catId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'order', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_life_wheel_questions_category ON life_wheel_questions (category)',
        'CREATE INDEX idx_life_wheel_questions_order ON life_wheel_questions (order)',
      ],
    })
    app.save(questions)

    var assessments = new Collection({
      name: 'life_wheel_assessments',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: '@request.auth.is_admin = true || user = @request.auth.id',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'type', type: 'select', required: true, values: ['pre', 'post'], maxSelect: 1 },
        { name: 'date', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'scores', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_life_wheel_assessments_user_type ON life_wheel_assessments (user, type)',
      ],
    })
    app.save(assessments)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('life_wheel_assessments'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('life_wheel_questions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('life_wheel_categories'))
    } catch (_) {}
  },
)
