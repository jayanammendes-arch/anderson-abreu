migrate(
  (app) => {
    const courses = new Collection({
      name: 'courses',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'thumbnail',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'category', type: 'text' },
        { name: 'is_available', type: 'bool' },
        { name: 'order', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_courses_order ON courses (order)',
        'CREATE INDEX idx_courses_category ON courses (category)',
      ],
    })
    app.save(courses)

    const coursesId = app.findCollectionByNameOrId('courses').id
    const modules = new Collection({
      name: 'modules',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'course',
          type: 'relation',
          required: true,
          collectionId: coursesId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'order', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_modules_course ON modules (course)',
        'CREATE INDEX idx_modules_order ON modules (order)',
      ],
    })
    app.save(modules)

    const modulesId = app.findCollectionByNameOrId('modules').id
    const lessons = new Collection({
      name: 'lessons',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'module',
          type: 'relation',
          required: true,
          collectionId: modulesId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'video_url', type: 'text' },
        { name: 'content', type: 'editor' },
        { name: 'duration', type: 'text' },
        { name: 'order', type: 'number', onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_lessons_module ON lessons (module)',
        'CREATE INDEX idx_lessons_order ON lessons (order)',
      ],
    })
    app.save(lessons)

    const lessonsId = app.findCollectionByNameOrId('lessons').id
    const userProgress = new Collection({
      name: 'user_progress',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
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
          name: 'lesson',
          type: 'relation',
          required: true,
          collectionId: lessonsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'completed', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_progress_user_lesson ON user_progress (user, lesson)',
      ],
    })
    app.save(userProgress)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('user_progress'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('lessons'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('modules'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('courses'))
    } catch (_) {}
  },
)
