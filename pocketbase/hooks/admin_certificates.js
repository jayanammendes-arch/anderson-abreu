routerAdd(
  'GET',
  '/backend/v1/admin/certificates',
  (e) => {
    if (!e.auth || !e.auth.getBool('is_admin')) {
      return e.forbiddenError('Admin access required')
    }
    const records = $app.findRecordsByFilter('certificates', '1=1', '-created', 200, 0)
    const result = records.map(function (r) {
      var userName = ''
      var courseTitle = ''
      try {
        var user = $app.findRecordById('users', r.getString('user'))
        userName = user.getString('name') || user.getString('email')
      } catch (_) {}
      try {
        var course = $app.findRecordById('courses', r.getString('course'))
        courseTitle = course.getString('title')
      } catch (_) {}
      return {
        id: r.id,
        user: r.getString('user'),
        userName: userName,
        course: r.getString('course'),
        courseTitle: courseTitle,
        issue_date: r.getString('issue_date'),
        workload_at_issue: r.get('workload_at_issue'),
        instructor_at_issue: r.getString('instructor_at_issue'),
        created: r.getString('created'),
        certificate_file: r.getString('certificate_file'),
      }
    })
    return e.json(200, result)
  },
  $apis.requireAuth(),
)
