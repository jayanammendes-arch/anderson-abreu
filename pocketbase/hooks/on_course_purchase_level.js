onRecordAfterCreateSuccess((e) => {
  var userId = e.record.getString('user')
  if (!userId) return e.next()

  try {
    var user = $app.findRecordById('users', userId)
    // Empty/null level means "Sem nivel" (a fresh signup with no purchase).
    // A purchase of any course promotes the student to "Ouro".
    // Students at "Prata" are explicitly granted that level by an administrator
    // and are NOT upgraded by a purchase — the admin's assignment takes
    // precedence, preserving the Prata benefits (including "Comece por Aqui").
    var currentLevel = user.getString('level')

    if (currentLevel !== 'Prata' && currentLevel !== 'Ouro' && currentLevel !== 'Diamante') {
      user.set('level', 'Ouro')
      $app.saveNoValidate(user)
      $app.logger().info('User level upgraded to Ouro via course purchase', 'userId', userId)
    }
  } catch (err) {
    $app.logger().error('Failed to upgrade user level on course purchase', 'error', String(err))
  }

  return e.next()
}, 'user_access')
