migrate(
  (app) => {
    var fqCol = app.findCollectionByNameOrId('form_questions')

    var existingTypes = {}
    try {
      var records = app.findRecordsByFilter('form_questions', 'id != ""', '', 1000, 0)
      for (var i = 0; i < records.length; i++) {
        existingTypes[records[i].id] = records[i].getString('question_type')
      }
    } catch (_) {}

    if (fqCol.fields.getByName('question_type')) {
      fqCol.fields.removeByName('question_type')
    }
    fqCol.fields.add(
      new SelectField({
        name: 'question_type',
        required: true,
        values: [
          'short_text',
          'paragraph',
          'multiple_choice',
          'checkboxes',
          'dropdown',
          'linear_scale',
          'date',
          'time',
        ],
        maxSelect: 1,
      }),
    )

    if (!fqCol.fields.getByName('description')) {
      fqCol.fields.add(new TextField({ name: 'description' }))
    }
    if (!fqCol.fields.getByName('shuffle_options')) {
      fqCol.fields.add(new BoolField({ name: 'shuffle_options' }))
    }
    if (!fqCol.fields.getByName('scale_min')) {
      fqCol.fields.add(new NumberField({ name: 'scale_min' }))
    }
    if (!fqCol.fields.getByName('scale_max')) {
      fqCol.fields.add(new NumberField({ name: 'scale_max' }))
    }
    if (!fqCol.fields.getByName('scale_label_left')) {
      fqCol.fields.add(new TextField({ name: 'scale_label_left' }))
    }
    if (!fqCol.fields.getByName('scale_label_right')) {
      fqCol.fields.add(new TextField({ name: 'scale_label_right' }))
    }
    if (!fqCol.fields.getByName('has_other')) {
      fqCol.fields.add(new BoolField({ name: 'has_other' }))
    }

    app.save(fqCol)

    for (var id in existingTypes) {
      var oldType = existingTypes[id]
      var newType = oldType === 'open_text' ? 'short_text' : oldType
      app
        .db()
        .newQuery('UPDATE form_questions SET question_type = {:type} WHERE id = {:id}')
        .bind({ type: newType, id: id })
        .execute()
    }

    var formsCol = app.findCollectionByNameOrId('forms')
    if (!formsCol.fields.getByName('color_theme')) {
      formsCol.fields.add(new TextField({ name: 'color_theme' }))
    }
    if (!formsCol.fields.getByName('header_image')) {
      formsCol.fields.add(
        new FileField({
          name: 'header_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!formsCol.fields.getByName('confirmation_message')) {
      formsCol.fields.add(new TextField({ name: 'confirmation_message' }))
    }
    if (!formsCol.fields.getByName('one_submission_message')) {
      formsCol.fields.add(new TextField({ name: 'one_submission_message' }))
    }
    app.save(formsCol)
  },
  (app) => {
    var fqCol = app.findCollectionByNameOrId('form_questions')
    if (fqCol.fields.getByName('question_type')) {
      fqCol.fields.removeByName('question_type')
    }
    fqCol.fields.add(
      new SelectField({
        name: 'question_type',
        required: true,
        values: ['multiple_choice', 'open_text'],
        maxSelect: 1,
      }),
    )
    var newFields = [
      'description',
      'shuffle_options',
      'scale_min',
      'scale_max',
      'scale_label_left',
      'scale_label_right',
      'has_other',
    ]
    for (var i = 0; i < newFields.length; i++) {
      if (fqCol.fields.getByName(newFields[i])) fqCol.fields.removeByName(newFields[i])
    }
    app.save(fqCol)

    app
      .db()
      .newQuery(
        "UPDATE form_questions SET question_type = 'open_text' WHERE question_type IN ('short_text', 'paragraph')",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE form_questions SET question_type = 'open_text' WHERE question_type NOT IN ('multiple_choice', 'open_text')",
      )
      .execute()

    var formsCol = app.findCollectionByNameOrId('forms')
    var formFields = [
      'color_theme',
      'header_image',
      'confirmation_message',
      'one_submission_message',
    ]
    for (var j = 0; j < formFields.length; j++) {
      if (formsCol.fields.getByName(formFields[j])) formsCol.fields.removeByName(formFields[j])
    }
    app.save(formsCol)
  },
)
