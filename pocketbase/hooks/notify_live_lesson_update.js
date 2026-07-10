onRecordAfterUpdateSuccess((e) => {
  var lesson = e.record
  var wasLive = e.record.original().getBool('is_live')
  var isLive = lesson.getBool('is_live')
  if (!isLive || wasLive) return e.next()

  var moduleId = lesson.getString('module')
  var lessonTitle = lesson.getString('title') || 'Aula ao vivo'
  var videoUrl = lesson.getString('video_url')

  try {
    var module = $app.findRecordById('modules', moduleId)
    var courseId = module.getString('course')
    var course = $app.findRecordById('courses', courseId)
    var courseTitle = course.getString('title') || 'Curso'

    var accessRecords = $app.findRecordsByFilter(
      'user_access',
      'course = "' + courseId + '"',
      '',
      0,
      0,
    )
    var notifCol = $app.findCollectionByNameOrId('notifications')

    for (var i = 0; i < accessRecords.length; i++) {
      var notif = new Record(notifCol)
      notif.set('user', accessRecords[i].getString('user'))
      notif.set('message', 'Aula ao vivo disponivel: ' + lessonTitle + ' - ' + courseTitle)
      notif.set('type', 'live_lesson')
      notif.set('read', false)
      $app.saveNoValidate(notif)
    }

    var adminUsers = $app.findRecordsByFilter('users', 'is_admin = true', '', 1, 0)
    if (adminUsers.length > 0) {
      var postsCol = $app.findCollectionByNameOrId('community_posts')
      var post = new Record(postsCol)
      post.set('user', adminUsers[0].id)
      post.set('type', 'text')
      var postContent = 'AO VIVO: ' + lessonTitle + '\nCurso: ' + courseTitle
      if (videoUrl) postContent += '\nLink: ' + videoUrl
      post.set('content', postContent)
      post.set('is_hidden', false)
      $app.saveNoValidate(post)
    }
  } catch (err) {
    $app.logger().error('failed to notify live lesson (update)', 'error', err.message)
  }

  return e.next()
}, 'lessons')
