migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('certificates')
    var field = col.fields.getByName('certificate_file')
    if (field) {
      col.fields.remove(field.getId())
      col.fields.add(
        new FileField({
          name: 'certificate_file',
          maxSelect: 1,
          maxSize: 26214400,
          mimeTypes: ['application/pdf'],
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('certificates')
    var field = col.fields.getByName('certificate_file')
    if (field) {
      col.fields.remove(field.getId())
      col.fields.add(
        new FileField({
          name: 'certificate_file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['application/pdf'],
        }),
      )
    }
    app.save(col)
  },
)
