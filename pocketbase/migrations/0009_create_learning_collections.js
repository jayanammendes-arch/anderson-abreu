migrate(
  (app) => {
    const modulesCol = app.findCollectionByNameOrId('modules')
    const lessonsCol = app.findCollectionByNameOrId('lessons')
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    app.save(
      new Collection({
        name: 'quizzes',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          {
            name: 'module',
            type: 'relation',
            required: true,
            collectionId: modulesCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'title', type: 'text', required: true },
          { name: 'min_score', type: 'number', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_quizzes_module ON quizzes (module)'],
      }),
    )

    var quizzesCol = app.findCollectionByNameOrId('quizzes')

    app.save(
      new Collection({
        name: 'quiz_questions',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          {
            name: 'quiz',
            type: 'relation',
            required: true,
            collectionId: quizzesCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'question', type: 'text', required: true },
          { name: 'options', type: 'json', required: true },
          { name: 'correct_answer', type: 'number', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_quiz_questions_quiz ON quiz_questions (quiz)'],
      }),
    )

    app.save(
      new Collection({
        name: 'quiz_results',
        type: 'base',
        listRule: "@request.auth.id != '' && user = @request.auth.id",
        viewRule: "@request.auth.id != '' && user = @request.auth.id",
        createRule: "@request.auth.id != '' && user = @request.auth.id",
        updateRule: "@request.auth.id != '' && user = @request.auth.id",
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
            name: 'quiz',
            type: 'relation',
            required: true,
            collectionId: quizzesCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'score', type: 'number', required: false },
          { name: 'total', type: 'number', required: false },
          { name: 'passed', type: 'bool', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_quiz_results_user ON quiz_results (user)',
          'CREATE INDEX idx_quiz_results_quiz ON quiz_results (quiz)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'lesson_materials',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          {
            name: 'lesson',
            type: 'relation',
            required: true,
            collectionId: lessonsCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'file',
            type: 'file',
            required: true,
            maxSelect: 1,
            maxSize: 10485760,
            mimeTypes: [
              'application/pdf',
              'image/jpeg',
              'image/png',
              'application/zip',
              'application/octet-stream',
              'text/plain',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'application/vnd.ms-powerpoint',
            ],
          },
          { name: 'label', type: 'text', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_lesson_materials_lesson ON lesson_materials (lesson)'],
      }),
    )

    app.save(
      new Collection({
        name: 'lesson_comments',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != '' && user = @request.auth.id",
        deleteRule: "@request.auth.id != '' && user = @request.auth.id",
        fields: [
          {
            name: 'lesson',
            type: 'relation',
            required: true,
            collectionId: lessonsCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
          },
          { name: 'content', type: 'text', required: true },
          { name: 'reactions', type: 'number', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_lesson_comments_lesson ON lesson_comments (lesson)'],
      }),
    )
  },
  (app) => {
    var names = ['lesson_comments', 'lesson_materials', 'quiz_results', 'quiz_questions', 'quizzes']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (_) {}
    }
  },
)
