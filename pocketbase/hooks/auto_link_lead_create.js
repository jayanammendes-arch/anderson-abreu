onRecordAfterCreateSuccess((e) => {
  var lead = e.record
  var linkedUser = lead.getString('linked_user')
  var leadEmail = lead.getString('email')
  var leadPhone = lead.getString('phone')
  var leadName = lead.getString('name')

  var normalizePhone = function (p) {
    if (!p) return ''
    var v = p.replace(/[\s\-\(\)\.]/g, '')
    if (v.indexOf('+55') === 0) v = v.substring(3)
    else if (v.indexOf('55') === 0 && v.length > 11) v = v.substring(2)
    if (v.indexOf('0') === 0) v = v.substring(1)
    return v
  }

  if (!linkedUser) {
    var matchedUser = null

    if (leadEmail) {
      try {
        matchedUser = $app.findAuthRecordByEmail('users', leadEmail)
      } catch (_) {}
    }

    if (!matchedUser && leadPhone) {
      var normLeadPhone = normalizePhone(leadPhone)
      if (normLeadPhone) {
        try {
          var users = $app.findRecordsByFilter('users', "phone != ''", '', 500, 0)
          for (var i = 0; i < users.length; i++) {
            if (normalizePhone(users[i].getString('phone')) === normLeadPhone) {
              matchedUser = users[i]
              break
            }
          }
        } catch (_) {}
      }
    }

    if (!matchedUser && leadPhone && leadName) {
      var normLeadPhone2 = normalizePhone(leadPhone)
      if (normLeadPhone2 && normLeadPhone2.length >= 8) {
        var firstName = leadName.split(' ')[0].toLowerCase()
        var leadLast8 = normLeadPhone2.substring(normLeadPhone2.length - 8)
        try {
          var users2 = $app.findRecordsByFilter('users', "phone != '' && name != ''", '', 500, 0)
          for (var j = 0; j < users2.length; j++) {
            var uFirst = users2[j].getString('name').split(' ')[0].toLowerCase()
            var uPhone = normalizePhone(users2[j].getString('phone'))
            var uLast8 = uPhone.length >= 8 ? uPhone.substring(uPhone.length - 8) : uPhone
            if (uFirst === firstName && uLast8 === leadLast8) {
              matchedUser = users2[j]
              break
            }
          }
        } catch (_) {}
      }
    }

    if (matchedUser) {
      try {
        lead.set('linked_user', matchedUser.id)
        $app.saveNoValidate(lead)
        linkedUser = matchedUser.id
      } catch (err) {
        $app.logger().error('auto_link_lead_create: save failed', 'error', String(err))
      }
    }
  }

  if (linkedUser && leadEmail) {
    try {
      var unlinked = $app.findRecordsByFilter(
        'crm_leads',
        "email = {:email} && linked_user = '' && id != {:currentId}",
        '',
        50,
        0,
        { email: leadEmail, currentId: lead.id },
      )
      for (var k = 0; k < unlinked.length; k++) {
        try {
          unlinked[k].set('linked_user', linkedUser)
          $app.saveNoValidate(unlinked[k])
        } catch (_) {}
      }
    } catch (err) {
      $app.logger().error('auto_link_lead_create: propagate failed', 'error', String(err))
    }
  }

  return e.next()
}, 'crm_leads')
