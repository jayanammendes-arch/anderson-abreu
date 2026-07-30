migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pre_hypnosis_forms')
    col.listRule = '@request.auth.id = user || @request.auth.is_admin = true'
    col.createRule = "@request.auth.id != '' && user = @request.auth.id"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('pre_hypnosis_forms')
    col.listRule = '@request.auth.is_admin = true'
    col.createRule = "@request.auth.id != ''"
    app.save(col)
  },
)
