migrate(
  (app) => {
    var coursesCol = app.findCollectionByNameOrId('courses')
    if (!coursesCol.fields.getByName('footer_banner')) {
      coursesCol.fields.add(
        new FileField({
          name: 'footer_banner',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!coursesCol.fields.getByName('catchy_title')) {
      coursesCol.fields.add(new TextField({ name: 'catchy_title' }))
    }
    if (!coursesCol.fields.getByName('public_description')) {
      coursesCol.fields.add(new EditorField({ name: 'public_description' }))
    }
    if (!coursesCol.fields.getByName('buy_button_text')) {
      coursesCol.fields.add(new TextField({ name: 'buy_button_text' }))
    }
    app.save(coursesCol)

    var modulesCol = app.findCollectionByNameOrId('modules')
    if (!modulesCol.fields.getByName('description')) {
      modulesCol.fields.add(new TextField({ name: 'description' }))
    }
    if (!modulesCol.fields.getByName('materials')) {
      modulesCol.fields.add(
        new FileField({
          name: 'materials',
          maxSelect: 10,
          maxSize: 5242880,
          mimeTypes: ['application/pdf'],
        }),
      )
    }
    app.save(modulesCol)

    var lessonsCol = app.findCollectionByNameOrId('lessons')
    if (!lessonsCol.fields.getByName('description')) {
      lessonsCol.fields.add(new TextField({ name: 'description' }))
    }
    if (!lessonsCol.fields.getByName('materials')) {
      lessonsCol.fields.add(
        new FileField({
          name: 'materials',
          maxSelect: 10,
          maxSize: 5242880,
          mimeTypes: ['application/pdf'],
        }),
      )
    }
    app.save(lessonsCol)
  },
  (app) => {
    var coursesCol = app.findCollectionByNameOrId('courses')
    ;['footer_banner', 'catchy_title', 'public_description', 'buy_button_text'].forEach(
      function (name) {
        if (coursesCol.fields.getByName(name)) coursesCol.fields.removeByName(name)
      },
    )
    app.save(coursesCol)

    var modulesCol = app.findCollectionByNameOrId('modules')
    ;['description', 'materials'].forEach(function (name) {
      if (modulesCol.fields.getByName(name)) modulesCol.fields.removeByName(name)
    })
    app.save(modulesCol)

    var lessonsCol = app.findCollectionByNameOrId('lessons')
    ;['description', 'materials'].forEach(function (name) {
      if (lessonsCol.fields.getByName(name)) lessonsCol.fields.removeByName(name)
    })
    app.save(lessonsCol)
  },
)
