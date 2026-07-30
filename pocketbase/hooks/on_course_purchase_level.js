onRecordAfterCreateSuccess((e) => {
  var userId = e.record.getString('user')
  if (!userId) return e.next()

  try {
    var user = $app.findRecordById('users', userId)
    var currentLevel = user.getString('level') || 'Prata'

    if (currentLevel === 'Prata') {
      user.set('level', 'Ouro')
      $app.saveNoValidate(user)
      $app.logger().info('User level upgraded to Ouro via course purchase', 'userId', userId)
    }
  } catch (err) {
    $app.logger().error('Failed to upgrade user level on course purchase', 'error', String(err))
  }

  return e.next()
}, 'user_access')
