onRecordAfterCreateSuccess((e) => {
  var post = e.record
  var userId = post.getString('user')
  if (!userId) return e.next()

  try {
    var author = $app.findRecordById('users', userId)
    if (!author.getBool('is_admin')) return e.next()

    var authorName = author.getString('name') || 'Admin'
    var message = authorName + ' publicou um novo anúncio na comunidade'

    var users = $app.findRecordsByFilter('users', "id != '" + userId + "'", '', 0, 0)
    var notifCol = $app.findCollectionByNameOrId('notifications')

    for (var i = 0; i < users.length; i++) {
      var notif = new Record(notifCol)
      notif.set('user', users[i].id)
      notif.set('message', message)
      notif.set('type', 'admin_post')
      notif.set('read', false)
      $app.saveNoValidate(notif)
    }
  } catch (err) {
    $app.logger().error('failed to create admin post notifications', 'error', err.message)
  }

  return e.next()
}, 'community_posts')
