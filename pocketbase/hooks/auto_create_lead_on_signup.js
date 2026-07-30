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

  var normalizePhone = function (p) {
    if (!p) return ''
    var v = p.replace(/[\s\-\(\)\.]/g, '')
    if (v.indexOf('+55') === 0) v = v.substring(3)
    else if (v.indexOf('55') === 0 && v.length > 11) v = v.substring(2)
    if (v.indexOf('0') === 0) v = v.substring(1)
    return v
  }

  try {
    var socialByEmail = $app.findRecordsByFilter(
      'crm_leads',
      "email = {:email} && source != 'site' && linked_user = ''",
      '',
      50,
      0,
      { email: userEmail },
    )
    for (var i = 0; i < socialByEmail.length; i++) {
      try {
        socialByEmail[i].set('linked_user', user.id)
        $app.saveNoValidate(socialByEmail[i])
      } catch (_) {}
    }
  } catch (err) {
    $app.logger().error('auto_create_lead_on_signup: email link failed', 'error', String(err))
  }

  var userPhone = user.getString('phone')
  if (userPhone) {
    var normUserPhone = normalizePhone(userPhone)
    if (normUserPhone) {
      try {
        var phoneLeads = $app.findRecordsByFilter(
          'crm_leads',
          "phone != '' && source != 'site' && linked_user = ''",
          '',
          500,
          0,
        )
        for (var j = 0; j < phoneLeads.length; j++) {
          if (normalizePhone(phoneLeads[j].getString('phone')) === normUserPhone) {
            try {
              phoneLeads[j].set('linked_user', user.id)
              $app.saveNoValidate(phoneLeads[j])
            } catch (_) {}
          }
        }
      } catch (err) {
        $app.logger().error('auto_create_lead_on_signup: phone link failed', 'error', String(err))
      }
    }
  }

  return e.next()
}, 'users')
