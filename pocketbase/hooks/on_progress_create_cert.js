onRecordAfterCreateSuccess((e) => {
  if (!e.record.getBool('completed')) return e.next()

  const userId = e.record.getString('user')
  const lessonId = e.record.getString('lesson')

  try {
    const lesson = $app.findRecordById('lessons', lessonId)
    const module = $app.findRecordById('modules', lesson.getString('module'))
    const courseId = module.getString('course')

    const courseModules = $app.findRecordsByFilter(
      'modules',
      'course = "' + courseId + '"',
      'order',
      0,
      0,
    )
    const moduleIds = []
    for (let i = 0; i < courseModules.length; i++) moduleIds.push(courseModules[i].id)

    const allLessons = []
    for (let j = 0; j < moduleIds.length; j++) {
      const ml = $app.findRecordsByFilter(
        'lessons',
        'module = "' + moduleIds[j] + '"',
        'order',
        0,
        0,
      )
      for (let k = 0; k < ml.length; k++) allLessons.push(ml[k])
    }

    if (allLessons.length === 0) return e.next()

    let allCompleted = true
    for (let l = 0; l < allLessons.length; l++) {
      try {
        const p = $app.findFirstRecordByFilter(
          'user_progress',
          'user = "' + userId + '" && lesson = "' + allLessons[l].id + '"',
        )
        if (!p.getBool('completed')) {
          allCompleted = false
          break
        }
      } catch (_) {
        allCompleted = false
        break
      }
    }
    if (!allCompleted) return e.next()

    let hasActiveQuiz = false
    let allQuizzesPassed = true
    for (let m = 0; m < moduleIds.length; m++) {
      try {
        const quizzes = $app.findRecordsByFilter(
          'quizzes',
          'module = "' + moduleIds[m] + '"',
          '',
          0,
          0,
        )
        for (let q = 0; q < quizzes.length; q++) {
          if (quizzes[q].getBool('is_active')) {
            hasActiveQuiz = true
            try {
              $app.findFirstRecordByFilter(
                'quiz_results',
                'user = "' + userId + '" && quiz = "' + quizzes[q].id + '" && passed = true',
              )
            } catch (_) {
              allQuizzesPassed = false
            }
          }
        }
      } catch (_) {}
    }
    if (hasActiveQuiz && !allQuizzesPassed) return e.next()

    try {
      $app.findFirstRecordByFilter(
        'certificates',
        'user = "' + userId + '" && course = "' + courseId + '"',
      )
      return e.next()
    } catch (_) {}

    const course = $app.findRecordById('courses', courseId)
    const instructorName = course.getString('instructor_name') || ''
    const manualWorkload = course.getNum('manual_workload') || 0

    let totalMinutes = 0
    for (let n = 0; n < allLessons.length; n++) {
      totalMinutes += allLessons[n].getNum('duration_minutes') || 0
    }
    const calculatedHours = totalMinutes / 60
    const workload = manualWorkload > 0 ? manualWorkload : Math.round(calculatedHours * 10) / 10

    const certCol = $app.findCollectionByNameOrId('certificates')
    const cert = new Record(certCol)
    cert.set('user', userId)
    cert.set('course', courseId)
    cert.set('issue_date', new Date().toISOString().split('T')[0])
    cert.set('workload_at_issue', workload)
    cert.set('instructor_at_issue', instructorName)
    $app.save(cert)

    const notifCol = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifCol)
    notif.set('user', userId)
    notif.set(
      'message',
      'Parabéns! Seu certificado do curso ' + course.getString('title') + ' já está disponível.',
    )
    notif.set('type', 'certificate')
    notif.set('read', false)
    $app.save(notif)
  } catch (_) {}

  return e.next()
}, 'user_progress')
