migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')

    if (!col.fields.getByName('birth_date')) {
      col.fields.add(new DateField({ name: 'birth_date' }))
    }
    if (!col.fields.getByName('phone')) {
      col.fields.add(new TextField({ name: 'phone' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    app.save(col)
  },
)
