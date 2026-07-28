migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('como_funciona_image')) {
      col.fields.add(
        new FileField({
          name: 'como_funciona_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        }),
      )
    }
    if (!col.fields.getByName('faixa_azul_frase')) {
      col.fields.add(new TextField({ name: 'faixa_azul_frase' }))
    }
    if (!col.fields.getByName('resultados_image')) {
      col.fields.add(
        new FileField({
          name: 'resultados_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        }),
      )
    }
    if (!col.fields.getByName('por_que_tantas_title')) {
      col.fields.add(new TextField({ name: 'por_que_tantas_title' }))
    }
    if (!col.fields.getByName('por_que_tantas_content')) {
      col.fields.add(new EditorField({ name: 'por_que_tantas_content' }))
    }
    if (!col.fields.getByName('comparacao_title')) {
      col.fields.add(new TextField({ name: 'comparacao_title' }))
    }
    if (!col.fields.getByName('comparacao_content')) {
      col.fields.add(new EditorField({ name: 'comparacao_content' }))
    }

    app.save(col)

    var psCol = app.findCollectionByNameOrId('platform_settings')
    if (!psCol.fields.getByName('global_blue_band_text')) {
      psCol.fields.add(new TextField({ name: 'global_blue_band_text' }))
    }
    app.save(psCol)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    var newFields = [
      'como_funciona_image',
      'faixa_azul_frase',
      'resultados_image',
      'por_que_tantas_title',
      'por_que_tantas_content',
      'comparacao_title',
      'comparacao_content',
    ]
    for (var i = 0; i < newFields.length; i++) {
      if (col.fields.getByName(newFields[i])) {
        col.fields.removeByName(newFields[i])
      }
    }
    app.save(col)

    var psCol = app.findCollectionByNameOrId('platform_settings')
    if (psCol.fields.getByName('global_blue_band_text')) {
      psCol.fields.removeByName('global_blue_band_text')
    }
    app.save(psCol)
  },
)
