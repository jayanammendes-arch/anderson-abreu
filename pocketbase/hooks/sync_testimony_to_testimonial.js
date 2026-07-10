onRecordAfterCreateSuccess((e) => {
  var post = e.record

  if (post.getString('type') !== 'testimony') return e.next()

  var userId = post.getString('user')
  if (!userId) return e.next()

  try {
    var user = $app.findRecordById('users', userId)
    var userName = user.getString('name') || 'Aluno'
    var userAvatar = user.getString('avatar')

    var testimonialsCol = $app.findCollectionByNameOrId('testimonials')
    var testimonial = new Record(testimonialsCol)

    testimonial.set('student_name', userName)
    testimonial.set('type', 'text')
    testimonial.set('content', post.getString('content'))
    testimonial.set('is_active', false)

    var courseId = post.getString('related_course')
    if (courseId) {
      testimonial.set('course', courseId)
    }

    if (userAvatar) {
      var pbUrl = $secrets.get('PB_INSTANCE_URL')
      var token = $secrets.get('PB_SUPERUSER_TOKEN')
      if (pbUrl && token) {
        var avatarUrl = pbUrl + '/api/files/users/' + userId + '/' + userAvatar
        var res = $http.send({
          url: avatarUrl,
          method: 'GET',
          headers: { Authorization: token },
          timeout: 15,
        })
        if (res.statusCode === 200 && res.body) {
          var file = $filesystem.fileFromBytes(res.body, userAvatar)
          testimonial.set('student_image', file)
        }
      }
    }

    $app.save(testimonial)
  } catch (err) {
    $app.logger().error('failed to sync testimony to testimonial', 'error', err.message)
  }

  return e.next()
}, 'community_posts')
