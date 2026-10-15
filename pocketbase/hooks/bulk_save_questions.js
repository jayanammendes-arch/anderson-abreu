routerAdd(
  'POST',
  '/backend/v1/forms/{formId}/questions/bulk',
  (e) => {
    const formId = e.request.pathValue('formId')
    const body = e.requestInfo().body || {}
    const questions = body.questions || []

    if (!Array.isArray(questions)) {
      return e.badRequestError('questions must be an array')
    }

    const validTypes = [
      'short_text',
      'paragraph',
      'multiple_choice',
      'checkboxes',
      'dropdown',
      'linear_scale',
      'date',
      'time',
    ]
    const savedIds = []
    const results = []

    try {
      $app.runInTransaction(function (txApp) {
        const col = txApp.findCollectionByNameOrId('form_questions')

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i]
          const qType = validTypes.indexOf(q.question_type) >= 0 ? q.question_type : 'short_text'

          if (qType === 'linear_scale') {
            const sMin = q.scale_min || 1
            const sMax = q.scale_max || 5
            if (sMin >= sMax) {
              throw new BadRequestError('scale_min deve ser menor que scale_max para escala linear')
            }
          }

          if (!q.question_text || !String(q.question_text).trim()) {
            throw new BadRequestError('Texto da pergunta é obrigatório')
          }

          const isTemp = !q.id || String(q.id).indexOf('temp-') === 0
          let record

          if (!isTemp) {
            try {
              record = txApp.findRecordById('form_questions', q.id)
            } catch (_) {
              record = new Record(col)
            }
          } else {
            record = new Record(col)
          }

          record.set('form', formId)
          record.set('question_text', q.question_text || '')
          record.set('question_type', qType)
          record.set('options', Array.isArray(q.options) ? q.options : [])
          record.set('order', i)
          const isReq = q.required === true || q.required === 'true' || q.required === 1
          record.set('required', isReq)
          record.set('description', q.description || '')
          record.set('shuffle_options', q.shuffle_options === true)
          record.set('scale_min', q.scale_min || 0)
          record.set('scale_max', q.scale_max || 0)
          record.set('scale_label_left', q.scale_label_left || '')
          record.set('scale_label_right', q.scale_label_right || '')
          record.set('has_other', q.has_other === true)

          txApp.save(record)
          savedIds.push(record.id)
          results.push(record)
        }

        const allExisting = txApp.findRecordsByFilter(
          'form_questions',
          'form = "' + formId + '"',
          'order',
          1000,
          0,
        )
        for (let j = 0; j < allExisting.length; j++) {
          if (savedIds.indexOf(allExisting[j].id) < 0) {
            txApp.delete(allExisting[j])
          }
        }
      })
    } catch (err) {
      if (err instanceof BadRequestError) throw err
      return e.json(500, { error: 'Erro ao salvar perguntas' })
    }

    return e.json(200, { questions: results })
  },
  $apis.requireAuth(),
)
