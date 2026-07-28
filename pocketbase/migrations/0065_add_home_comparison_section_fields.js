migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')

    if (!col.fields.getByName('home_section_title')) {
      col.fields.add(new TextField({ name: 'home_section_title' }))
    }
    if (!col.fields.getByName('home_section_subtitle')) {
      col.fields.add(new TextField({ name: 'home_section_subtitle' }))
    }
    if (!col.fields.getByName('home_column1_items')) {
      col.fields.add(new JSONField({ name: 'home_column1_items' }))
    }
    if (!col.fields.getByName('home_column2_items')) {
      col.fields.add(new JSONField({ name: 'home_column2_items' }))
    }
    if (!col.fields.getByName('home_section_footer')) {
      col.fields.add(new TextField({ name: 'home_section_footer' }))
    }

    app.save(col)

    try {
      const records = app.findRecordsByFilter('platform_settings', "id != ''", '', 1, 0)
      if (records.length > 0) {
        const record = records[0]
        record.set('home_section_title', 'Por que tantas pessoas buscam a Hipnoterapia?')
        record.set(
          'home_section_subtitle',
          'Conheça as características que tornam a hipnoterapia uma abordagem diferenciada para o equilíbrio emocional.',
        )
        record.set(
          'home_column1_items',
          JSON.stringify([
            { text: 'Abordagem natural e não invasiva', icon: 'leaf' },
            { text: 'Atendimento 100% personalizado', icon: 'heart' },
            {
              text: 'Foco em resolver a raiz do problema. Que fica no subconsciente, além da consciência da pessoa.',
              icon: 'brain',
            },
            { text: 'Sessões individuais e acolhedoras', icon: 'hand-heart' },
            {
              text: 'Relaxamento profundo guiado que permite chegar nas causas dos problemas',
              icon: 'waves',
            },
            { text: 'Resultado rápido, eficaz e duradouro', icon: 'zap' },
          ]),
        )
        record.set(
          'home_column2_items',
          JSON.stringify([
            { text: 'Processos geralmente mais extensos', icon: 'clock' },
            { text: 'Abordagem predominantemente padronizada', icon: 'square' },
            { text: 'Foco principal no controle de sintomas', icon: 'bandage' },
            { text: 'Tratamento mais demorado. Entre 3 a 8 anos', icon: 'timer' },
            { text: 'Menor ênfase no relaxamento', icon: 'battery-warning' },
            { text: 'Adaptação gradual e contínua', icon: 'refresh-cw' },
          ]),
        )
        record.set(
          'home_section_footer',
          '* As abordagens convencionais são igualmente importantes e complementares. O objetivo não é substituir, mas apresentar uma alternativa natural eficaz.',
        )
        app.save(record)
      }
    } catch (_) {}
  },
  (app) => {
    const col = app.findCollectionByNameOrId('platform_settings')
    app.save(col)
  },
)
