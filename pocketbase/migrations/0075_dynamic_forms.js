migrate(
  (app) => {
    var coursesCol = app.findCollectionByNameOrId('courses')
    if (coursesCol.fields.getByName('access_type')) {
      coursesCol.fields.removeByName('access_type')
    }
    coursesCol.fields.add(
      new SelectField({ name: 'access_type', values: ['free', 'paid'], maxSelect: 1 }),
    )
    app.save(coursesCol)

    var formsCol = new Collection({
      name: 'forms',
      type: 'base',
      listRule: 'is_active = true || @request.auth.is_admin = true',
      viewRule: 'is_active = true || @request.auth.is_admin = true',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(formsCol)

    var formsId = app.findCollectionByNameOrId('forms').id

    var formQuestionsCol = new Collection({
      name: 'form_questions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        {
          name: 'form',
          type: 'relation',
          required: true,
          collectionId: formsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'question_text', type: 'text', required: true },
        {
          name: 'question_type',
          type: 'select',
          required: true,
          values: ['multiple_choice', 'open_text'],
          maxSelect: 1,
        },
        { name: 'options', type: 'json' },
        { name: 'order', type: 'number' },
        { name: 'required', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_form_questions_form ON form_questions (form)'],
    })
    app.save(formQuestionsCol)

    var formSubmissionsCol = new Collection({
      name: 'form_submissions',
      type: 'base',
      listRule: '@request.auth.id = user || @request.auth.is_admin = true',
      viewRule: '@request.auth.id = user || @request.auth.is_admin = true',
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: null,
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
          name: 'form',
          type: 'relation',
          required: true,
          collectionId: formsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'answers', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_form_submissions_user ON form_submissions (user)',
        'CREATE INDEX idx_form_submissions_form ON form_submissions (form)',
      ],
    })
    app.save(formSubmissionsCol)

    var defaultFormId = null
    try {
      var existingForm = app.findFirstRecordByData('forms', 'title', 'Formulário Pré-Hipnose')
      defaultFormId = existingForm.id
    } catch (_) {
      var fCol = app.findCollectionByNameOrId('forms')
      var formRecord = new Record(fCol)
      formRecord.set('title', 'Formulário Pré-Hipnose')
      formRecord.set('description', 'Formulário inicial para processo de hipnose')
      formRecord.set('is_active', true)
      app.save(formRecord)
      defaultFormId = formRecord.id

      var fqCol = app.findCollectionByNameOrId('form_questions')
      var seedQuestions = [
        { text: 'Qual é o seu nome completo?', type: 'open_text', order: 0 },
        { text: 'Qual é o seu telefone?', type: 'open_text', order: 1 },
        { text: 'Qual o motivo da busca por hipnose?', type: 'open_text', order: 2 },
        { text: 'Possui alguma condição de saúde relevante?', type: 'open_text', order: 3 },
        { text: 'Faz uso de algum medicamento?', type: 'open_text', order: 4 },
        { text: 'Quais são suas expectativas com o tratamento?', type: 'open_text', order: 5 },
      ]
      for (var i = 0; i < seedQuestions.length; i++) {
        var sq = seedQuestions[i]
        var qRecord = new Record(fqCol)
        qRecord.set('form', defaultFormId)
        qRecord.set('question_text', sq.text)
        qRecord.set('question_type', sq.type)
        qRecord.set('order', sq.order)
        qRecord.set('required', true)
        app.save(qRecord)
      }
    }

    try {
      var config = app.findFirstRecordByData('onboarding_config', 'title', 'Comece por Aqui')
      var steps = config.get('steps')
      if (typeof steps === 'string') {
        steps = JSON.parse(steps)
      }
      if (Array.isArray(steps) && steps.length > 0) {
        for (var j = 0; j < steps.length; j++) {
          if (steps[j].type === 'form' && !steps[j].form_id) {
            steps[j].form_id = defaultFormId
          }
        }
        config.set('steps', steps)
        app.save(config)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('form_submissions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('form_questions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('forms'))
    } catch (_) {}

    var coursesCol = app.findCollectionByNameOrId('courses')
    if (coursesCol.fields.getByName('access_type')) {
      coursesCol.fields.removeByName('access_type')
    }
    coursesCol.fields.add(
      new SelectField({ name: 'access_type', values: ['free', 'paid', 'hypnosis'], maxSelect: 1 }),
    )
    app.save(coursesCol)
  },
)
