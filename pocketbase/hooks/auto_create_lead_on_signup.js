onRecordAfterCreateSuccess((e) => {
  var user = e.record
  var userEmail = user.getString('email')
  if (!userEmail) {
    return e.next()
  }

  try {
    var existing = $app.findFirstRecordByFilter(
      'crm_leads',
      "email = {:email} && source = 'site'",
      { email: userEmail },
    )
    if (existing) {
      return e.next()
    }
  } catch (_) {}

  try {
    var crmCol = $app.findCollectionByNameOrId('crm_leads')
    var record = new Record(crmCol)
    record.set('name', user.getString('name') || '')
    record.set('email', userEmail)
    record.set('phone', user.getString('phone') || '')
    record.set('instagram_handle', user.getString('instagram_handle') || '')
    record.set('source', 'site')
    record.set('linked_user', user.id)
    record.set('stage', 'Leads externos')
    $app.save(record)
  } catch (err) {
    $app.logger().error('auto_create_lead_on_signup failed', 'error', String(err))
  }

  return e.next()
}, 'users')
