migrate(
  (app) => {
    const records = app.findRecordsByFilter('treatment_categories', '', '', 100, 0)
    records.forEach((rec) => {
      let updated = false
      const fields = [
        'como_funciona_text',
        'resultados_text',
        'sintomas_text',
        'detailed_content',
        'cta_text',
        'por_que_tantas_content',
        'comparacao_content',
      ]
      fields.forEach((f) => {
        let val = rec.getString(f)
        if (val) {
          // Strip face="Times New Roman" or face="..." attributes from HTML
          const newVal = val
            .replace(/face="[^"]*"/gi, '')
            .replace(/face='[^']*'/gi, '')
            .replace(/font-family:[^;"]+;?/gi, '')
          if (newVal !== val) {
            rec.set(f, newVal)
            updated = true
          }
        }
      })
      if (updated) {
        app.save(rec)
      }
    })
  },
  (app) => {},
)
