onRecordAfterUpdateSuccess((e) => {
  var newLevel = e.record.getString('level')
  var oldLevel = e.record.original().getString('level')

  if (newLevel === oldLevel) return e.next()
  if (!newLevel) return e.next()

  var userId = e.record.id
  var userName = e.record.getString('name') || 'Aluno'

  var message = 'Parabéns! Seu nível foi atualizado para ' + newLevel + '.'

  try {
    var notifCol = $app.findCollectionByNameOrId('notifications')
    var notif = new Record(notifCol)
    notif.set('user', userId)
    notif.set('message', message)
    notif.set('type', 'level_upgrade')
    notif.set('read', false)
    $app.saveNoValidate(notif)
    $app
      .logger()
      .info(
        'Level change notification created',
        'userId',
        userId,
        'oldLevel',
        oldLevel,
        'newLevel',
        newLevel,
      )
  } catch (err) {
    $app.logger().error('Failed to create level change notification', 'error', String(err))
  }

  return e.next()
}, 'users')
