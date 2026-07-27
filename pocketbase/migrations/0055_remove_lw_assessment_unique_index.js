migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('life_wheel_assessments')
    col.removeIndex('idx_life_wheel_assessments_user_type')
    col.addIndex('idx_life_wheel_assessments_user', false, 'user', '')
    col.listRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.is_admin = true)"
    col.viewRule =
      "@request.auth.id != '' && (user = @request.auth.id || @request.auth.is_admin = true)"
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('life_wheel_assessments')
    col.removeIndex('idx_life_wheel_assessments_user')
    col.addIndex('idx_life_wheel_assessments_user_type', true, 'user, type', '')
    col.listRule = "@request.auth.id != '' && user = @request.auth.id"
    col.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    app.save(col)
  },
)
