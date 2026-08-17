// Padroniza TODOS os campos de texto rico de TODAS as categorias de tratamento,
// removendo fontes antigas (<font face="Times New Roman">, estilos inline de font-family/font-size)
// para que o CSS da plataforma (Open Sans para conteúdo, Playfair Display para títulos) passe a
// controlar a tipografia de forma idêntica à categoria Ansiedade.
migrate(
  (app) => {
    // Todos os campos de texto rico da collection treatment_categories
    const richFields = [
      'detailed_content',
      'como_funciona_text',
      'como_funciona_title',
      'resultados_text',
      'resultados_title',
      'sintomas_text',
      'sintomas_title',
      'sintomas_corpo_text',
      'sintomas_mente_text',
      'cta_title',
      'cta_text',
      'por_que_tantas_title',
      'por_que_tantas_content',
      'comparacao_title',
      'comparacao_content',
      'symptoms_list',
      'faixa_text',
    ]

    // Limpa HTML removendo fontes antigas e estilos inline de fonte.
    function cleanHtml(html) {
      if (!html) return html
      let out = html
      // 1. Remove atributos face="..." e face='...' de qualquer tag
      out = out.replace(/\s+face="[^"]*"/gi, '')
      out = out.replace(/\s+face='[^']*'/gi, '')
      // 2. Remove propriedades font-family / font-size de estilos inline (style="...")
      out = out.replace(/font-family\s*:[^;"']+;?/gi, '')
      out = out.replace(/font-size\s*:[^;"']+;?/gi, '')
      // 3. Remove atributos size="..." de tags <font> (legado)
      out = out.replace(/\s+size="[^"]*"/gi, '')
      out = out.replace(/\s+size='[^']*'/gi, '')
      // 4. Desembrulha tags <font ...>...</font> (deprecated) mantendo o conteúdo
      out = out.replace(/<font[^>]*>/gi, '')
      out = out.replace(/<\/font>/gi, '')
      // 5. Limpa style="" vazios remanescentes
      out = out.replace(/\s+style=""/gi, '')
      out = out.replace(/\s+style=''/gi, '')
      // 6. Remove spans que ficaram vazios
      out = out.replace(/<span[^>]*>\s*<\/span>/gi, '')
      return out
    }

    const records = app.findRecordsByFilter('treatment_categories', '', '', 200, 0)
    records.forEach((rec) => {
      let updated = false
      richFields.forEach((f) => {
        const val = rec.getString(f)
        if (val) {
          const newVal = cleanHtml(val)
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
