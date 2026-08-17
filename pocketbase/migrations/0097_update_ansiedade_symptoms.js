migrate(
  (app) => {
    try {
      const record = app.findFirstRecordByData('treatment_categories', 'slug', 'ansiedade')
      if (record) {
        record.set('sintomas_title', 'Sintomas da Ansiedade?')
        record.set(
          'sintomas_mente_text',
          '<div>Pensamentos acelerados que não desrodam ("fuzuê" mental)</div><div><br></div><div>Sensação constante de que algo ruim vai acontecer a qualquer momento</div><div><br></div><div>Dificuldade de concentração, lapsos de memória e sensação de esgotamento</div><div><br></div><div>Irritabilidade, impaciência e oscilações de humor</div><div><br></div><div>Necessidade de ter controle absoluto sobre tudo ou tendência a evitar situações por medo</div>',
        )
        app.save(record)
      }
    } catch (_) {}
  },
  (app) => {
    // no-op revert
  },
)
