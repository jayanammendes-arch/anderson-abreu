// Atualiza os valores padrão de font_sizes para sintomas_corpo.content e sintomas_mente.content de 18 para 20
// em TODAS as categorias de tratamento existentes.
migrate(
  (app) => {
    var records = app.findRecordsByFilter('treatment_categories', '', '', 500, 0)
    records.forEach(function (rec) {
      var raw = rec.getString('font_sizes')
      var obj = {}
      if (raw && raw !== '' && raw !== 'null') {
        try {
          obj = JSON.parse(raw)
        } catch (_) {
          obj = {}
        }
      }

      if (!obj.sintomas_corpo) {
        obj.sintomas_corpo = { title: 40, content: 20 }
      } else {
        obj.sintomas_corpo.content = 20
      }

      if (!obj.sintomas_mente) {
        obj.sintomas_mente = { title: 40, content: 20 }
      } else {
        obj.sintomas_mente.content = 20
      }

      rec.set('font_sizes', JSON.stringify(obj))
      app.save(rec)
    })
  },
  (app) => {
    var records = app.findRecordsByFilter('treatment_categories', '', '', 500, 0)
    records.forEach(function (rec) {
      var raw = rec.getString('font_sizes')
      var obj = {}
      if (raw && raw !== '' && raw !== 'null') {
        try {
          obj = JSON.parse(raw)
        } catch (_) {
          obj = {}
        }
      }

      if (obj.sintomas_corpo && obj.sintomas_corpo.content === 20) {
        obj.sintomas_corpo.content = 18
      }

      if (obj.sintomas_mente && obj.sintomas_mente.content === 20) {
        obj.sintomas_mente.content = 18
      }

      rec.set('font_sizes', JSON.stringify(obj))
      app.save(rec)
    })
  },
)
