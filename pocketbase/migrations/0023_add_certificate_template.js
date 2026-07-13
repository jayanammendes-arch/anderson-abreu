migrate(
  (app) => {
    var coursesCol = app.findCollectionByNameOrId('courses')
    if (!coursesCol.fields.getByName('certificate_template')) {
      coursesCol.fields.add(
        new FileField({
          name: 'certificate_template',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(coursesCol)
  },
  (app) => {
    var coursesCol = app.findCollectionByNameOrId('courses')
    var ctField = coursesCol.fields.getByName('certificate_template')
    if (ctField) coursesCol.fields.remove(ctField.getId())
    app.save(coursesCol)
  },
)
