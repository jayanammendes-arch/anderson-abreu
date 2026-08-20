// Atualiza o valor padrão de font_sizes para detailed_content.content de 18 para 15
// em TODAS as categorias na coleção treatment_categories.
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

      if (!obj.detailed_content) {
        obj.detailed_content = { title: 40, content: 15 }
      } else {
        obj.detailed_content.content = 15
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

      if (obj.detailed_content && obj.detailed_content.content === 15) {
        obj.detailed_content.content = 18
      }

      rec.set('font_sizes', JSON.stringify(obj))
      app.save(rec)
    })
  },
)
