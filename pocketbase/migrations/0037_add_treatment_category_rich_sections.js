migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('como_funciona_text')) {
      col.fields.add(new EditorField({ name: 'como_funciona_text', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('como_funciona_images')) {
      col.fields.add(
        new FileField({
          name: 'como_funciona_images',
          maxSelect: 3,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!col.fields.getByName('resultados_text')) {
      col.fields.add(new EditorField({ name: 'resultados_text', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('resultados_images')) {
      col.fields.add(
        new FileField({
          name: 'resultados_images',
          maxSelect: 3,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!col.fields.getByName('cta_text')) {
      col.fields.add(new EditorField({ name: 'cta_text', maxSize: 5242880 }))
    }
    if (!col.fields.getByName('cta_images')) {
      col.fields.add(
        new FileField({
          name: 'cta_images',
          maxSelect: 3,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('treatment_categories')

    try {
      col.fields.removeByName('como_funciona_text')
    } catch (_) {}
    try {
      col.fields.removeByName('como_funciona_images')
    } catch (_) {}
    try {
      col.fields.removeByName('resultados_text')
    } catch (_) {}
    try {
      col.fields.removeByName('resultados_images')
    } catch (_) {}
    try {
      col.fields.removeByName('cta_text')
    } catch (_) {}
    try {
      col.fields.removeByName('cta_images')
    } catch (_) {}

    app.save(col)
  },
)
