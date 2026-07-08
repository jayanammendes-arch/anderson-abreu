migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'jayanammendes@gmail.com')
      record.set('is_admin', true)
      app.save(record)
    } catch (_) {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      const record = new Record(users)
      record.setEmail('jayanammendes@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Jayana Mendes')
      record.set('is_admin', true)
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'jayanammendes@gmail.com')
      record.set('is_admin', false)
      app.save(record)
    } catch (_) {}
  },
)
