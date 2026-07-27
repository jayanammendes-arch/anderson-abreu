migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('about_environment_images')

    if (!col.fields.getByName('caption')) {
      col.fields.add(new TextField({ name: 'caption', max: 255 }))
    }
    app.save(col)

    var captions = ['Recepção', 'Sala de Atendimento', 'Certificados', 'Poltrona de Consultório']

    var records = []
    try {
      records = app.findRecordsByFilter('about_environment_images', "id != ''", 'order', 100, 0)
    } catch (_) {}

    for (var i = 0; i < records.length; i++) {
      if (!records[i].getString('caption')) {
        records[i].set('caption', captions[i % captions.length] || '')
        try {
          app.save(records[i])
        } catch (_) {
          app.saveNoValidate(records[i])
        }
      }
    }
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('about_environment_images')
      col.fields.removeByName('caption')
      app.save(col)
    } catch (_) {}
  },
)
