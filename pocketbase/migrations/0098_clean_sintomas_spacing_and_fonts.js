migrate(
  (app) => {
    try {
      const record = app.findFirstRecordByData('treatment_categories', 'slug', 'ansiedade')
      if (record) {
        // Limpa estilos inline de font-size e tags <br> vazias em sintomas_corpo_text e sintomas_mente_text
        let corpo = record.getString('sintomas_corpo_text') || ''
        let mente = record.getString('sintomas_mente_text') || ''

        corpo = corpo.replace(/font-size\s*:[^;"']+;?/gi, '')
        corpo = corpo.replace(/\s+style=["']\s*["']/gi, '')

        mente = mente.replace(/font-size\s*:[^;"']+;?/gi, '')
        mente = mente.replace(/\s+style=["']\s*["']/gi, '')
        mente = mente.replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '')
        mente = mente.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')

        record.set('sintomas_corpo_text', corpo)
        record.set('sintomas_mente_text', mente)
        app.save(record)
      }
    } catch (_) {}
  },
  (app) => {},
)
