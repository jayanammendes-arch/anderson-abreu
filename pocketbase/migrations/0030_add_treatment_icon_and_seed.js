migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatments')

    if (!col.fields.getByName('icon')) {
      col.fields.add(new TextField({ name: 'icon' }))
    }
    app.save(col)

    var treatmentSeeds = [
      {
        name: 'Ansiedade',
        slug: 'ansiedade',
        short_description:
          'Tratamento eficaz para quadros de ansiedade generalizada, crises de pânico e preocupações excessivas.',
        detailed_content:
          '<h2>O que é Ansiedade</h2><p>A ansiedade é uma resposta natural do corpo, mas quando se torna persistente e desproporcional, pode prejudicar significativamente a qualidade de vida. Através da hipnose clínica, trabalhamos diretamente com o subconsciente para reprogramar padrões de pensamento que alimentam a ansiedade.</p><h3>Como funciona</h3><p>Utilizamos técnicas de sugestão e regressão para identificar a raiz dos gatilhos ansiosos, promovendo um estado de calma profunda e controle emocional. O tratamento é personalizado e respeita o ritmo de cada paciente.</p>',
        icon: 'Brain',
      },
      {
        name: 'Depressão',
        slug: 'depressao',
        short_description:
          'Abordagem hipnoterapêutica para quadros depressivos, ajudando a resgatar motivação e bem-estar.',
        detailed_content:
          '<h2>Depressão e Hipnose</h2><p>A depressão afeta milhões de pessoas e pode se manifestar de diversas formas. A hipnose clínica oferece uma via complementar de tratamento, atuando nos padrões mentais que perpetuam o estado depressivo.</p><h3>Como funciona</h3><p>Através de sessões estruturadas, ajudamos o paciente a acessar recursos internos de motivação, ressignificar experiências passadas e construir uma visão mais positiva do futuro. O processo é colaborativo e seguro.</p>',
        icon: 'Heart',
      },
      {
        name: 'Dor Crônica',
        slug: 'dor-cronica',
        short_description:
          'Gestão de dor crônica através de técnicas hipnóticas que modulam a percepção da dor.',
        detailed_content:
          '<h2>Dor Crônica</h2><p>A dor crônica é uma condição complexa que afeta tanto o corpo quanto a mente. A hipnose tem sido amplamente reconhecida pela comunidade científica como uma ferramenta eficaz no manejo da dor.</p><h3>Como funciona</h3><p>Ensinamos o cérebro a reinterpretar os sinais de dor, utilizando sugestões hipnóticas que promovem relaxamento profundo e alteram a percepção sensorial. Muitos pacientes relatam redução significativa na intensidade da dor após poucas sessões.</p>',
        icon: 'Activity',
      },
      {
        name: 'Fobias',
        slug: 'fobias',
        short_description:
          'Superação de fobias específicas e sociais através de dessensibilização hipnótica.',
        detailed_content:
          '<h2>Fobias</h2><p>Fobias são medos irracionais e intensos que podem limitar drasticamente a vida de uma pessoa. Seja medo de altura, animais, voar ou espaços fechados, a hipnose oferece um caminho rápido e eficaz para superá-los.</p><h3>Como funciona</h3><p>Através de técnicas de dessensibilização sistemática sob hipnose, o paciente é gradualmente exposto ao objeto do medo em um estado de relaxamento profundo, permitindo que o cérebro recondicione sua resposta emocional.</p>',
        icon: 'Shield',
      },
      {
        name: 'Insônia',
        slug: 'insonia',
        short_description:
          'Tratamento de distúrbios do sono através de hipnose para promover descanso restaurador.',
        detailed_content:
          '<h2>Insônia</h2><p>A insônia afeta a saúde física, mental e emocional. A hipnose clínica é uma das abordagens mais eficazes para restaurar padrões de sono saudáveis, sem o uso de medicamentos.</p><h3>Como funciona</h3><p>Trabalhamos com sugestões que acalmam a mente, reduzem a ruminação noturna e estabelecem um ritual natural de sono. O paciente aprende técnicas de auto-hipnose que pode usar independentemente para garantir noites tranquilas.</p>',
        icon: 'Moon',
      },
      {
        name: 'Traumas',
        slug: 'traumas',
        short_description:
          'Processamento e superação de traumas emocionais através de terapia regressiva.',
        detailed_content:
          '<h2>Traumas Emocionais</h2><p>Traumas podem deixar marcas profundas que afetam comportamentos, relacionamentos e a saúde mental. A hipnose clínica oferece um caminho seguro para processar e liberar essas experiências.</p><h3>Como funciona</h3><p>Utilizamos técnicas de regressão terapêutica para acessar a memória onde o trauma foi armazenado, permitindo que o paciente ressignifique a experiência e libere a carga emocional associada, tudo em um ambiente seguro e controlado.</p>',
        icon: 'HeartHandshake',
      },
      {
        name: 'Tabagismo',
        slug: 'tabagismo',
        short_description:
          'Cessação do tabagismo em uma única sessão de hipnose focada em quebra de padrão.',
        detailed_content:
          '<h2>Tabagismo</h2><p>Parar de fumar é um dos maiores desafios para muitos, mas a hipnose tem uma taxa de sucesso impressionante neste tratamento, frequentemente resolvendo o problema em uma única sessão.</p><h3>Como funciona</h3><p>Através de sugestões hipnóticas direcionadas, reprogramamos a associação mental que liga o cigarro ao prazer ou alívio, substituindo-a por sentimentos de independência e bem-estar. O método é indolor e duradouro.</p>',
        icon: 'Zap',
      },
      {
        name: 'Estresse',
        slug: 'estresse',
        short_description:
          'Gestão de estresse crônico e sobrecarga emocional através de hipnose relaxante.',
        detailed_content:
          '<h2>Estresse</h2><p>O estresse crônico é uma das principais causas de problemas de saúde física e mental. A hipnose clínica oferece ferramentas poderosas para reduzir a tensão e restaurar o equilíbrio.</p><h3>Como funciona</h3><p>Através de induções profundas e sugestões calmantes, ajudamos o paciente a acessar um estado de relaxamento profundo, redefinindo a forma como o cérebro responde aos estímulos estressantes do dia a dia.</p>',
        icon: 'Flower2',
      },
      {
        name: 'Autoestima',
        slug: 'autoestima',
        short_description:
          'Fortalecimento da autoconfiança e autoimagem através de sugestões positivas.',
        detailed_content:
          '<h2>Autoestima</h2><p>A baixa autoestima afeta relacionamentos, carreira e qualidade de vida. A hipnose trabalha na raiz do problema, reprogramando crenças limitantes no nível subconsciente.</p><h3>Como funciona</h3><p>Identificamos e substituímos mensagens internas negativas por afirmações fortalecedoras, ajudando o paciente a desenvolver uma relação mais saudável e amorosa consigo mesmo.</p>',
        icon: 'Smile',
      },
      {
        name: 'Pânico',
        slug: 'panico',
        short_description:
          'Controle de crises de pânico e transtorno de pânico através de hipnose clínica.',
        detailed_content:
          '<h2>Pânico</h2><p>As crises de pânico são episódios intensos de medo que podem ser incapacitantes. A hipnose oferece uma abordagem eficaz para prevenir e gerenciar esses episódios.</p><h3>Como funciona</h3><p>Ensinamos técnicas de auto-regulação que o paciente pode usar no momento de uma crise, além de trabalhar a raiz do transtorno para reduzir a frequência e intensidade dos episódios.</p>',
        icon: 'Eye',
      },
      {
        name: 'Compulsões',
        slug: 'compulsao',
        short_description:
          'Quebra de padrões compulsivos alimentares, compras e outros comportamentos.',
        detailed_content:
          '<h2>Compulsões</h2><p>Compulsões alimentares, por compras, jogos ou outros comportamentos podem destruir relacionamentos e finanças. A hipnose atua no padrão automático que alimenta o comportamento.</p><h3>Como funciona</h3><p>Trabalhamos com a identificação dos gatilhos e a reprogramação da resposta automática, substituindo o comportamento compulsivo por escolhas conscientes e saudáveis.</p>',
        icon: 'Scale',
      },
      {
        name: 'Bem-Estar',
        slug: 'bem-estar',
        short_description:
          'Promoção de equilíbrio emocional geral e qualidade de vida através de hipnose.',
        detailed_content:
          '<h2>Bem-Estar</h2><p>Mesmo sem um quadro clínico específico, a hipnose pode ser uma ferramenta poderosa para promover bem-estar geral, foco mental e equilíbrio emocional.</p><h3>Como funciona</h3><p>Sessões de hipnose preventiva ajudam a fortalecer a resiliência emocional, melhorar a concentração, aumentar a motivação e promover uma sensação geral de bem-estar e plenitude.</p>',
        icon: 'Sparkles',
      },
    ]

    for (var i = 0; i < treatmentSeeds.length; i++) {
      var seed = treatmentSeeds[i]
      var existing = null
      try {
        existing = app.findFirstRecordByData('treatments', 'slug', seed.slug)
      } catch (_) {}

      if (existing) {
        existing.set('icon', seed.icon)
        existing.set('order', i)
        if (!existing.getString('short_description')) {
          existing.set('short_description', seed.short_description)
        }
        app.save(existing)
      } else {
        var rec = new Record(col)
        rec.set('name', seed.name)
        rec.set('slug', seed.slug)
        rec.set('short_description', seed.short_description)
        rec.set('detailed_content', seed.detailed_content)
        rec.set('order', i)
        rec.set('icon', seed.icon)
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('treatments')
      try {
        col.fields.removeByName('icon')
      } catch (_) {}
      app.save(col)
    } catch (_) {}
  },
)
