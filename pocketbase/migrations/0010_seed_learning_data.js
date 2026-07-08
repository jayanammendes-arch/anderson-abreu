migrate(
  (app) => {
    var modules = []
    try {
      modules = app.findRecordsByFilter('modules', "id != ''", 'order', 10, 0)
    } catch (_) {}
    if (modules.length === 0) return

    var firstModule = modules[0]

    try {
      app.findFirstRecordByData('quizzes', 'module', firstModule.id)
    } catch (_) {
      var quizCol = app.findCollectionByNameOrId('quizzes')
      var quiz = new Record(quizCol)
      quiz.set('module', firstModule.id)
      quiz.set('title', 'Prova - ' + firstModule.get('title'))
      quiz.set('min_score', 70)
      app.save(quiz)

      var qCol = app.findCollectionByNameOrId('quiz_questions')
      var questions = [
        {
          question: 'Qual e o objetivo principal deste modulo introdutorio?',
          options: [
            'Apresentar os conceitos fundamentais',
            'Avaliar o conhecimento final',
            'Pratica avancada de tecnicas',
            'Revisao geral do curso',
          ],
          correct: 0,
        },
        {
          question: 'O que e fundamental para um aprendizado eficaz?',
          options: [
            'Pratica constante e dedicacao',
            'Apenas leitura teorica',
            'Pular aulas dificeis',
            'Nao fazer anotacoes',
          ],
          correct: 0,
        },
        {
          question: 'Como devemos abordar novos conceitos?',
          options: [
            'Com foco e atencao plena',
            'Com pressa e ansiedade',
            'Ignorando dificuldades',
            'Sem qualquer planejamento',
          ],
          correct: 0,
        },
      ]
      for (var i = 0; i < questions.length; i++) {
        var rec = new Record(qCol)
        rec.set('quiz', quiz.id)
        rec.set('question', questions[i].question)
        rec.set('options', questions[i].options)
        rec.set('correct_answer', questions[i].correct)
        app.save(rec)
      }
    }

    var lessons = []
    try {
      lessons = app.findRecordsByFilter('lessons', "id != ''", 'order', 5, 0)
    } catch (_) {}
    if (lessons.length === 0) return

    var firstLesson = lessons[0]

    try {
      var existing = app.findRecordsByFilter(
        'lesson_comments',
        "lesson = '" + firstLesson.id + "'",
        '',
        1,
        0,
      )
      if (existing.length === 0) throw new Error('no comments')
    } catch (_) {
      var users = []
      try {
        users = app.findRecordsByFilter('users', "id != ''", 'created', 1, 0)
      } catch (_) {}
      if (users.length > 0) {
        var commentCol = app.findCollectionByNameOrId('lesson_comments')
        var comment = new Record(commentCol)
        comment.set('lesson', firstLesson.id)
        comment.set('user', users[0].id)
        comment.set('content', 'Excelente aula! Muito esclarecedora e bem explicada.')
        comment.set('reactions', 5)
        app.save(comment)
      }
    }
  },
  (app) => {},
)
