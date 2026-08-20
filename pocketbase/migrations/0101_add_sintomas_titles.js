migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('sintomas_corpo_title')) {
      col.fields.add(new EditorField({ name: 'sintomas_corpo_title' }))
    }

    if (!col.fields.getByName('sintomas_mente_title')) {
      col.fields.add(new EditorField({ name: 'sintomas_mente_title' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('treatment_categories')

    if (col.fields.getByName('sintomas_corpo_title')) {
      col.fields.removeByName('sintomas_corpo_title')
    }

    if (col.fields.getByName('sintomas_mente_title')) {
      col.fields.removeByName('sintomas_mente_title')
    }

    app.save(col)
  },
)
