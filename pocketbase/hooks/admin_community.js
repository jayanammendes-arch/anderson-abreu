routerAdd(
  'GET',
  '/backend/v1/admin/community',
  (e) => {
    if (!e.auth || !e.auth.getBool('is_admin')) {
      return e.forbiddenError('Admin access required')
    }
    const records = $app.findRecordsByFilter('community_posts', '1=1', '-created', 200, 0)
    const result = records.map(function (r) {
      var userName = ''
      try {
        var user = $app.findRecordById('users', r.getString('user'))
        userName = user.getString('name') || user.getString('email')
      } catch (_) {}
      return {
        id: r.id,
        user: r.getString('user'),
        userName: userName,
        type: r.getString('type'),
        content: r.getString('content'),
        is_hidden: r.getBool('is_hidden'),
        video_url: r.getString('video_url'),
        created: r.getString('created'),
      }
    })
    return e.json(200, result)
  },
  $apis.requireAuth(),
)
