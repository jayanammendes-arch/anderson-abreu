onRecordAfterCreateSuccess((e) => {
  var purchase = e.record
  var mentorshipService = purchase.getString('mentorship_service')
  if (!mentorshipService) return e.next()

  var userId = purchase.getString('user')
  var leadId = purchase.getString('lead')

  if (!userId && leadId) {
    try {
      var lead = $app.findRecordById('crm_leads', leadId)
      userId = lead.getString('linked_user')
    } catch (_) {}
  }

  if (!userId) return e.next()

  try {
    var user = $app.findRecordById('users', userId)
    var currentLevel = user.getString('level')

    // Mentoring purchase upgrades a Gold ("Ouro") student to "Diamante".
    // It never touches "Prata" (admin-assigned) or "Diamante" (already top).
    if (currentLevel === 'Ouro') {
      user.set('level', 'Diamante')
      $app.saveNoValidate(user)
      $app
        .logger()
        .info('User level upgraded to Diamante via mentorship purchase', 'userId', userId)
    }
  } catch (err) {
    $app.logger().error('Failed to upgrade user level on mentorship purchase', 'error', String(err))
  }

  return e.next()
}, 'crm_purchases')
