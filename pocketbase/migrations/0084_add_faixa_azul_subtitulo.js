migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('faixa_azul_subtitulo')) {
      col.fields.add(new TextField({ name: 'faixa_azul_subtitulo' }))
    }

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    if (col.fields.getByName('faixa_azul_subtitulo')) {
      col.fields.removeByName('faixa_azul_subtitulo')
    }
    app.save(col)
  },
)
