onRecordUpdate((e) => {
  var email = e.record.getString('email')
  if (!email) {
    e.next()
    return
  }

  var existingLinked = e.record.getString('linked_user')
  if (existingLinked) {
    e.next()
    return
  }

  try {
    var user = $app.findAuthRecordByEmail('users', email)
    if (user) {
      e.record.set('linked_user', user.id)
    }
  } catch (_) {}

  e.next()
}, 'crm_leads')
