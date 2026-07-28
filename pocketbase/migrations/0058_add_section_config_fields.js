migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('como_funciona_title')) {
      col.fields.add(new TextField({ name: 'como_funciona_title' }))
    }
    if (!col.fields.getByName('resultados_title')) {
      col.fields.add(new TextField({ name: 'resultados_title' }))
    }
    if (!col.fields.getByName('sintomas_title')) {
      col.fields.add(new TextField({ name: 'sintomas_title' }))
    }
    if (!col.fields.getByName('cta_title')) {
      col.fields.add(new TextField({ name: 'cta_title' }))
    }
    if (!col.fields.getByName('sections_config')) {
      col.fields.add(new JSONField({ name: 'sections_config', maxSize: 5242880 }))
    }

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    try {
      col.fields.removeByName('como_funciona_title')
    } catch (_) {}
    try {
      col.fields.removeByName('resultados_title')
    } catch (_) {}
    try {
      col.fields.removeByName('sintomas_title')
    } catch (_) {}
    try {
      col.fields.removeByName('cta_title')
    } catch (_) {}
    try {
      col.fields.removeByName('sections_config')
    } catch (_) {}
    app.save(col)
  },
)
