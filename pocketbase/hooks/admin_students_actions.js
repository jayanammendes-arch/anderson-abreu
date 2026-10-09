// Endpoints administrativos para gerenciamento avançado de alunos:
// 1. POST /backend/v1/admin/students/{id}/delete - Exclui o aluno e todos os dados dependentes
// 2. POST /backend/v1/admin/students/{id}/reset-comece-por-aqui - Zera apenas dados do Comece por Aqui (form_submissions, pre_hypnosis_forms, life_wheel_assessments pre)

routerAdd(
  'POST',
  '/backend/v1/admin/students/{id}/delete',
  (e) => {
    if (!e.auth || !e.auth.getBool('is_admin')) {
      return e.forbiddenError('Acesso restrito a administradores')
    }

    var studentId = e.request.pathValue('id')
    if (!studentId) {
      return e.badRequestError('ID do aluno não informado')
    }

    if (studentId === e.auth.id) {
      return e.badRequestError('Não é permitido excluir o próprio usuário logado')
    }

    var studentRecord
    try {
      studentRecord = $app.findRecordById('users', studentId)
    } catch (_) {
      return e.notFoundError('Aluno não encontrado')
    }

    // Executa a exclusão de dependências e do aluno
    try {
      // 1. Exclui progresso de aulas (user_progress)
      try {
        var progress = $app.findRecordsByFilter('user_progress', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var i = 0; i < progress.length; i++) {
          try {
            $app.delete(progress[i])
          } catch (_) {}
        }
      } catch (_) {}

      // 2. Exclui acessos a cursos (user_access)
      try {
        var accesses = $app.findRecordsByFilter('user_access', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var j = 0; j < accesses.length; j++) {
          try {
            $app.delete(accesses[j])
          } catch (_) {}
        }
      } catch (_) {}

      // 3. Exclui envios de formulários dinâmicos (form_submissions)
      try {
        var submissions = $app.findRecordsByFilter('form_submissions', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var k = 0; k < submissions.length; k++) {
          try {
            $app.delete(submissions[k])
          } catch (_) {}
        }
      } catch (_) {}

      // 4. Exclui fichas pré-hipnose (pre_hypnosis_forms)
      try {
        var preForms = $app.findRecordsByFilter('pre_hypnosis_forms', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var l = 0; l < preForms.length; l++) {
          try {
            $app.delete(preForms[l])
          } catch (_) {}
        }
      } catch (_) {}

      // 5. Exclui avaliações da Roda da Vida (life_wheel_assessments)
      try {
        var assessments = $app.findRecordsByFilter(
          'life_wheel_assessments',
          'user = {:uid}',
          '',
          0,
          0,
          { uid: studentId },
        )
        for (var m = 0; m < assessments.length; m++) {
          try {
            $app.delete(assessments[m])
          } catch (_) {}
        }
      } catch (_) {}

      // 6. Exclui certificados (certificates)
      try {
        var certs = $app.findRecordsByFilter('certificates', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var n = 0; n < certs.length; n++) {
          try {
            $app.delete(certs[n])
          } catch (_) {}
        }
      } catch (_) {}

      // 7. Exclui resultados de quizzes (quiz_results)
      try {
        var quizResults = $app.findRecordsByFilter('quiz_results', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var p = 0; p < quizResults.length; p++) {
          try {
            $app.delete(quizResults[p])
          } catch (_) {}
        }
      } catch (_) {}

      // 8. Exclui comentários de aulas (lesson_comments)
      try {
        var comments = $app.findRecordsByFilter('lesson_comments', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var q = 0; q < comments.length; q++) {
          try {
            $app.delete(comments[q])
          } catch (_) {}
        }
      } catch (_) {}

      // 9. Exclui notificações (notifications)
      try {
        var notifs = $app.findRecordsByFilter('notifications', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var r = 0; r < notifs.length; r++) {
          try {
            $app.delete(notifs[r])
          } catch (_) {}
        }
      } catch (_) {}

      // 10. Desvincula leads do CRM associados a este aluno para não deixar foreign key quebrada
      try {
        var leads = $app.findRecordsByFilter('crm_leads', 'linked_user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var s = 0; s < leads.length; s++) {
          try {
            leads[s].set('linked_user', null)
            $app.saveNoValidate(leads[s])
          } catch (_) {}
        }
      } catch (_) {}

      // 11. Remove interações e compras no CRM com este aluno
      try {
        var crmInteractions = $app.findRecordsByFilter(
          'crm_interactions',
          'user = {:uid}',
          '',
          0,
          0,
          { uid: studentId },
        )
        for (var t = 0; t < crmInteractions.length; t++) {
          try {
            $app.delete(crmInteractions[t])
          } catch (_) {}
        }
      } catch (_) {}

      try {
        var crmPurchases = $app.findRecordsByFilter('crm_purchases', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var u = 0; u < crmPurchases.length; u++) {
          try {
            $app.delete(crmPurchases[u])
          } catch (_) {}
        }
      } catch (_) {}

      // 12. Exclui o próprio usuário
      $app.delete(studentRecord)

      return e.json(200, {
        success: true,
        message: 'Aluno e dados dependentes excluídos com sucesso',
      })
    } catch (err) {
      $app.logger().error('Falha ao excluir aluno', 'studentId', studentId, 'error', String(err))
      return e.json(500, { error: 'Falha ao excluir aluno: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/admin/students/{id}/reset-comece-por-aqui',
  (e) => {
    if (!e.auth || !e.auth.getBool('is_admin')) {
      return e.forbiddenError('Acesso restrito a administradores')
    }

    var studentId = e.request.pathValue('id')
    if (!studentId) {
      return e.badRequestError('ID do aluno não informado')
    }

    try {
      $app.findRecordById('users', studentId)
    } catch (_) {
      return e.notFoundError('Aluno não encontrado')
    }

    var deletedCounts = {
      form_submissions: 0,
      pre_hypnosis_forms: 0,
      life_wheel_assessments_pre: 0,
    }

    try {
      // 1. Registros de form_submissions do aluno
      try {
        var submissions = $app.findRecordsByFilter('form_submissions', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var i = 0; i < submissions.length; i++) {
          try {
            $app.delete(submissions[i])
            deletedCounts.form_submissions++
          } catch (_) {}
        }
      } catch (err1) {
        $app.logger().error('reset-comece: erro form_submissions', 'error', String(err1))
      }

      // 2. Registros de pre_hypnosis_forms do aluno
      try {
        var preForms = $app.findRecordsByFilter('pre_hypnosis_forms', 'user = {:uid}', '', 0, 0, {
          uid: studentId,
        })
        for (var j = 0; j < preForms.length; j++) {
          try {
            $app.delete(preForms[j])
            deletedCounts.pre_hypnosis_forms++
          } catch (_) {}
        }
      } catch (err2) {
        $app.logger().error('reset-comece: erro pre_hypnosis_forms', 'error', String(err2))
      }

      // 3. Registros de life_wheel_assessments onde type = 'pre'
      try {
        var assessmentsPre = $app.findRecordsByFilter(
          'life_wheel_assessments',
          "user = {:uid} && type = 'pre'",
          '',
          0,
          0,
          { uid: studentId },
        )
        for (var k = 0; k < assessmentsPre.length; k++) {
          try {
            $app.delete(assessmentsPre[k])
            deletedCounts.life_wheel_assessments_pre++
          } catch (_) {}
        }
      } catch (err3) {
        $app.logger().error('reset-comece: erro life_wheel_assessments', 'error', String(err3))
      }

      return e.json(200, {
        success: true,
        message: 'Fluxo "Comece por Aqui" zerado com sucesso',
        deleted: deletedCounts,
      })
    } catch (err) {
      $app
        .logger()
        .error('Falha ao zerar Comece por Aqui', 'studentId', studentId, 'error', String(err))
      return e.json(500, { error: 'Falha ao zerar Comece por Aqui: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)
