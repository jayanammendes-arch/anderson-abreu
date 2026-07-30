migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('users')
    col.updateRule = '@request.auth.is_admin = true || @request.auth.id = id'
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('users')
    col.updateRule = 'id = @request.auth.id'
    app.save(col)
  },
)
