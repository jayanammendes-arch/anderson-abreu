// Substitui o sistema de níveis de heading (h1–h6) por um modelo simples de
// tamanhos de fonte em px por seção. Remove o campo JSON `heading_sizes` e
// adiciona `font_sizes` (também JSON) com o shape:
//   {
//     como_funciona:    { title: 40, content: 18 },
//     resultados:       { title: 40, content: 18 },
//     sintomas_corpo:   { title: 40, content: 18 },
//     sintomas_mente:   { title: 40, content: 18 },
//     cta:              { title: 40, content: 18 },
//     detailed_content: { title: 40, content: 18 }
//   }
// Registros existentes recebem esses valores padrão. O campo antigo
// `heading_sizes` é removido (a UI não o referencia mais).
migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('font_sizes')) {
      col.fields.add(new JSONField({ name: 'font_sizes', maxSize: 5242880 }))
    }

    app.save(col)

    var defaultFontSizes = {
      como_funciona: { title: 40, content: 18 },
      resultados: { title: 40, content: 18 },
      sintomas_corpo: { title: 40, content: 18 },
      sintomas_mente: { title: 40, content: 18 },
      cta: { title: 40, content: 18 },
      detailed_content: { title: 40, content: 18 },
    }

    var records = app.findRecordsByFilter('treatment_categories', '', '', 200, 0)
    records.forEach(function (rec) {
      var raw = rec.getString('font_sizes')
      if (!raw || raw === '' || raw === '{}' || raw === 'null') {
        rec.set('font_sizes', JSON.stringify(defaultFontSizes))
        app.save(rec)
      }
    })

    // Remove o campo legado `heading_sizes` após garantir `font_sizes`.
    try {
      col.fields.removeByName('heading_sizes')
      app.save(col)
    } catch (_) {}
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('heading_sizes')) {
      col.fields.add(new JSONField({ name: 'heading_sizes', maxSize: 5242880 }))
    }
    try {
      col.fields.removeByName('font_sizes')
    } catch (_) {}
    app.save(col)
  },
)
