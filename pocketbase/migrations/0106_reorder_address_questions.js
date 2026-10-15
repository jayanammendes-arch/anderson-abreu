migrate(
  (app) => {
    // Reordenar perguntas de endereço para o formulário 'ktk6vu3zh4y3r7f'
    // Ordem desejada:
    // 6: CEP ("Digite seu CEP (apenas números):")
    // 7: Rua ("Endereço: (Apenas rua e nº da casa)")
    // 8: Bairro ("Bairro:")
    // 9: Cidade ("Cidade:")
    // 10: Estado ("Estado:")
    // 11: País ("País:")
    const formId = 'ktk6vu3zh4y3r7f'

    // Buscar perguntas do formulário
    const questions = app.findRecordsByFilter(
      'form_questions',
      `form = '${formId}'`,
      'order',
      100,
      0,
    )

    if (!questions || questions.length === 0) {
      // Idempotente / no-op em banco fresco/vazio
      return
    }

    // Mapeamento por id específico ou por padrão de texto caso ids divirjam
    const targetOrders = {
      // CEP
      krccba0vrth4da6: 6,
      // Endereço / Rua
      '37w2degmtk90asi': 7,
      // Bairro
      xgenndqgdwbimhm: 8,
      // Cidade
      u8lwujgfv4z6rzg: 9,
      // Estado
      sp8r9wajskosr57: 10,
      // País
      '9wh3e4srgniltzv': 11,
    }

    // Fallback por texto da pergunta se os IDs forem diferentes
    const findByText = (query) => {
      return questions.find((q) => {
        const text = (q.get('question_text') || '').toLowerCase()
        return text.includes(query.toLowerCase())
      })
    }

    // Se os IDs existirem nas questions, usamos o mapa direto
    for (const q of questions) {
      const id = q.id
      if (targetOrders[id] !== undefined) {
        q.set('order', targetOrders[id])
        app.save(q)
      }
    }

    // Checagem defensiva caso os IDs não tenham batido mas os textos existam
    const cepQ = findByText('cep')
    if (cepQ && cepQ.get('order') !== 6) {
      cepQ.set('order', 6)
      app.save(cepQ)
    }

    const ruaQ = findByText('endereço') || findByText('rua')
    if (ruaQ && ruaQ.get('order') !== 7) {
      ruaQ.set('order', 7)
      app.save(ruaQ)
    }

    const bairroQ = findByText('bairro')
    if (bairroQ && bairroQ.get('order') !== 8) {
      bairroQ.set('order', 8)
      app.save(bairroQ)
    }

    const cidadeQ = findByText('cidade')
    if (cidadeQ && cidadeQ.get('order') !== 9) {
      cidadeQ.set('order', 9)
      app.save(cidadeQ)
    }

    const estadoQ = findByText('estado')
    if (estadoQ && estadoQ.get('order') !== 10) {
      estadoQ.set('order', 10)
      app.save(estadoQ)
    }

    const paisQ = findByText('país') || findByText('pais')
    if (paisQ && paisQ.get('order') !== 11) {
      paisQ.set('order', 11)
      app.save(paisQ)
    }
  },
  (app) => {
    const formId = 'ktk6vu3zh4y3r7f'
    const questions = app.findRecordsByFilter(
      'form_questions',
      `form = '${formId}'`,
      'order',
      100,
      0,
    )
    if (!questions || questions.length === 0) return

    // Reverter para ordem anterior
    // 6: CEP
    // 7: País
    // 8: Estado
    // 9: Cidade
    // 10: Endereço
    // 11: Bairro
    const revertOrders = {
      krccba0vrth4da6: 6,
      '9wh3e4srgniltzv': 7,
      sp8r9wajskosr57: 8,
      u8lwujgfv4z6rzg: 9,
      '37w2degmtk90asi': 10,
      xgenndqgdwbimhm: 11,
    }

    for (const q of questions) {
      const id = q.id
      if (revertOrders[id] !== undefined) {
        q.set('order', revertOrders[id])
        app.save(q)
      }
    }
  },
)
