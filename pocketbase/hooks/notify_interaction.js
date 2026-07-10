onRecordAfterCreateSuccess((e) => {
  var interaction = e.record
  var postId = interaction.getString('post')
  var userId = interaction.getString('user')
  var type = interaction.getString('type')

  if (!postId || !userId) return e.next()

  try {
    var post = $app.findRecordById('community_posts', postId)
    var postAuthorId = post.getString('user')

    if (postAuthorId === userId) return e.next()

    var interactionUser = $app.findRecordById('users', userId)
    var userName = interactionUser.getString('name') || 'Alguém'

    var message = ''
    var notifType = ''
    if (type === 'like') {
      message = userName + ' curtiu sua publicação'
      notifType = 'like'
    } else if (type === 'comment') {
      message = userName + ' comentou na sua publicação'
      notifType = 'comment'
    } else {
      return e.next()
    }

    var notifCol = $app.findCollectionByNameOrId('notifications')
    var notif = new Record(notifCol)
    notif.set('user', postAuthorId)
    notif.set('message', message)
    notif.set('type', notifType)
    notif.set('read', false)
    $app.saveNoValidate(notif)
  } catch (err) {
    $app.logger().error('failed to create interaction notification', 'error', err.message)
  }

  return e.next()
}, 'community_interactions')
