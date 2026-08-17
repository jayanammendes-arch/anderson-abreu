migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('sintomas_corpo_text')) {
      col.fields.add(new EditorField({ name: 'sintomas_corpo_text' }))
    }

    if (!col.fields.getByName('sintomas_mente_text')) {
      col.fields.add(new EditorField({ name: 'sintomas_mente_text' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('treatment_categories')

    if (col.fields.getByName('sintomas_corpo_text')) {
      col.fields.removeByName('sintomas_corpo_text')
    }

    if (col.fields.getByName('sintomas_mente_text')) {
      col.fields.removeByName('sintomas_mente_text')
    }

    app.save(col)
  },
)
