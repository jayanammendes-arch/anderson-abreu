// Correção da 0093: o regex anterior não tratava entidades HTML (&quot;) dentro de
// valores font-family/font-size, deixando sobras quebradas como
// style="Times New Roman&quot;; ". Esta migration reprocessa todos os campos de
// texto rico com regex mais robusto (cada propriedade até o próximo ";") e também
// limpa atributos style que ficaram vazios ou contendo apenas sobras de fonte.
migrate(
  (app) => {
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

    function cleanHtml(html) {
      if (!html) return html
      let out = html

      // 1. Remove atributos face="..." e face='...'
      out = out.replace(/\s+face="[^"]*"/gi, '')
      out = out.replace(/\s+face='[^']*'/gi, '')

      // 2. Remove propriedades font-family e font-size de estilos inline.
      // Usa [^;]* (até o próximo ";") para capturar valores com aspas/entidades.
      out = out.replace(/font-family\s*:[^;]*;?/gi, '')
      out = out.replace(/font-size\s*:[^;]*;?/gi, '')

      // 3. Remove atributos size="..." de tags <font> (legado)
      out = out.replace(/\s+size="[^"]*"/gi, '')
      out = out.replace(/\s+size='[^']*'/gi, '')

      // 4. Desembrulha tags <font ...>...</font> (deprecated) mantendo o conteúdo
      out = out.replace(/<font[^>]*>/gi, '')
      out = out.replace(/<\/font>/gi, '')

      // 5. Remove qualquer atributo style="..." que ficou vazio ou contendo apenas
      //    sobras (espaços, ";", ":", nomes de fonte órfãos sem propriedade).
      //    Padrão: style="<somente não-letras significativas/nomes soltos>"
      //    Estratégia: se o conteúdo do style não tiver um par propriedade:valor
      //    válido (palavra seguida de ":" seguida de valor não-vazio), remove.
      out = out.replace(/\s+style="([^"]*)"/gi, (match, inner) => {
        const s = String(inner).trim()
        // Vazio ou só pontuação
        if (!s || /^[;:\s]*$/.test(s)) return ''
        // Contém um par propriedade:valor válido? (ex: "color: #fff" ou "background: ...")
        if (/[a-zA-Z-]+\s*:\s*[^;]+/.test(s)) return match
        // Caso contrário é sobra órfã (ex: 'Times New Roman&quot;; ')
        return ''
      })
      out = out.replace(/\s+style='([^']*)'/gi, (match, inner) => {
        const s = String(inner).trim()
        if (!s || /^[;:\s]*$/.test(s)) return ''
        if (/[a-zA-Z-]+\s*:\s*[^;]+/.test(s)) return match
        return ''
      })

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
