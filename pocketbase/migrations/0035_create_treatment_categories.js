migrate(
  (app) => {
    const collection = new Collection({
      name: 'treatment_categories',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'short_description', type: 'text', required: true },
        { name: 'detailed_content', type: 'editor', required: false, maxSize: 5242880 },
        {
          name: 'image',
          type: 'file',
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'icon', type: 'text', required: true },
        { name: 'symptoms_list', type: 'editor', required: false, maxSize: 5242880 },
        { name: 'order', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_treatment_categories_slug ON treatment_categories (slug)',
        'CREATE INDEX idx_treatment_categories_order ON treatment_categories (order)',
      ],
    })
    app.save(collection)

    var col = app.findCollectionByNameOrId('treatment_categories')
    var seeds = [
      {
        name: 'Ansiedade',
        slug: 'ansiedade',
        icon: 'brain',
        order: 0,
        short_description:
          'Tratamento eficaz para ansiedade generalizada, crises de pânico e preocupações excessivas.',
        detailed_content:
          '<h2>O que é Ansiedade</h2><p>A ansiedade é uma resposta natural do corpo, mas quando se torna persistente e desproporcional, pode prejudicar significativamente a qualidade de vida.</p><p>Através da hipnose clínica, trabalhamos diretamente com o subconsciente para reprogramar padrões de pensamento que alimentam a ansiedade, promovendo um estado de calma profunda e controle emocional.</p>',
        symptoms_list:
          '<ul><li>Preocupação excessiva e constante</li><li>Tensão muscular</li><li>Dificuldade de concentração</li><li>Irritabilidade aumentada</li><li>Perturbações do sono</li></ul>',
      },
      {
        name: 'Síndrome do Pânico',
        slug: 'sindrome-do-panico',
        icon: 'heart-pulse',
        order: 1,
        short_description:
          'Controle de crises de pânico e transtorno de pânico através de hipnose clínica.',
        detailed_content:
          '<h2>O que é Síndrome do Pânico</h2><p>As crises de pânico são episódios intensos de medo acompanhados de sintomas físicos como taquicardia, sudorese e falta de ar.</p><p>A hipnose oferece uma abordagem eficaz para prevenir e gerenciar esses episódios, trabalhando a raiz do transtorno para reduzir frequência e intensidade.</p>',
        symptoms_list:
          '<ul><li>Taquicardia e palpitações</li><li>Sensação de sufocamento</li><li>Medo de perder o controle</li><li>Tremores e suores</li><li>Evitação de situações gatilho</li></ul>',
      },
      {
        name: 'Estresse',
        slug: 'estresse',
        icon: 'flame',
        order: 2,
        short_description:
          'Gestão de estresse crônico e sobrecarga emocional através de hipnose relaxante.',
        detailed_content:
          '<h2>O que é Estresse</h2><p>O estresse crônico é uma das principais causas de problemas de saúde física e mental, afetando produtividade e bem-estar.</p><p>Através de induções profundas e sugestões calmantes, ajudamos a acessar um estado de relaxamento profundo, redefinindo a forma como o cérebro responde aos estímulos estressantes.</p>',
        symptoms_list:
          '<ul><li>Cansaço constante</li><li>Dificuldade para relaxar</li><li>Alterações de humor</li><li>Tensões físicas (cabeça, pescoço, ombros)</li><li>Perturbações do sono</li></ul>',
      },
      {
        name: 'Depressão',
        slug: 'depressao',
        icon: 'cloud-rain',
        order: 3,
        short_description:
          'Abordagem hipnoterapêutica para quadros depressivos, ajudando a resgatar motivação e bem-estar.',
        detailed_content:
          '<h2>O que é Depressão</h2><p>A depressão afeta milhões de pessoas e pode se manifestar como desânimo, perda de interesse e alterações de sono e apetite.</p><p>A hipnose clínica oferece uma via complementar de tratamento, atuando nos padrões mentais que perpetuam o estado depressivo e ajudando a acessar recursos internos de motivação.</p>',
        symptoms_list:
          '<ul><li>Tristeza persistente</li><li>Perda de interesse em atividades</li><li>Fadiga e falta de energia</li><li>Alterações de apetite</li><li>Sentimentos de desesperança</li></ul>',
      },
      {
        name: 'Fobias',
        slug: 'fobias',
        icon: 'ghost',
        order: 4,
        short_description:
          'Superação de fobias específicas e sociais através de dessensibilização hipnótica.',
        detailed_content:
          '<h2>O que são Fobias</h2><p>Fobias são medos irracionais e intensos que podem limitar drasticamente a vida de uma pessoa.</p><p>Através de técnicas de dessensibilização sistemática sob hipnose, o paciente é gradualmente exposto ao objeto do medo em estado de relaxamento profundo, permitindo recondicionamento da resposta emocional.</p>',
        symptoms_list:
          '<ul><li>Medo intenso e desproporcional</li><li>Evitação de situações específicas</li><li>Suores e taquicardia frente ao gatilho</li><li>Sensação de pânico</li><li>Reconhecimento de que o medo é irracional</li></ul>',
      },
      {
        name: 'Luto, Perdas Emocionais e Angústia',
        slug: 'luto-perdas-emocionais-e-angustia',
        icon: 'heart-crack',
        order: 5,
        short_description:
          'Processamento e superação de perdas emocionais através de terapia hipnótica.',
        detailed_content:
          '<h2>Luto e Perdas Emocionais</h2><p>O luto é uma resposta natural à perda, mas quando prolongado pode causar sofrimento significativo e impactar a saúde mental.</p><p>A hipnose clínica oferece um caminho seguro para processar e liberar a carga emocional associada à perda, permitindo ressignificar a experiência.</p>',
        symptoms_list:
          '<ul><li>Tristeza profunda e prolongada</li><li>Sentimento de vazio</li><li>Dificuldade em aceitar a perda</li><li>Isolamento social</li><li>Alterações de sono e apetite</li></ul>',
      },
      {
        name: 'Distúrbios de Sono e Bruxismo',
        slug: 'disturbios-do-sono-e-bruxismo',
        icon: 'moon',
        order: 6,
        short_description:
          'Tratamento de distúrbios do sono e bruxismo através de hipnose para promover descanso restaurador.',
        detailed_content:
          '<h2>Distúrbios de Sono e Bruxismo</h2><p>A insônia e o bruxismo afetam a saúde física, mental e emocional, comprometendo a qualidade de vida.</p><p>Trabalhamos com sugestões que acalmam a mente, reduzem a ruminação noturna e relaxam a musculatura, promovendo noites tranquilas e reparadoras.</p>',
        symptoms_list:
          '<ul><li>Dificuldade para adormecer</li><li>Acordar várias vezes à noite</li><li>Ranger de dentes (bruxismo)</li><li>Sensação de cansaço ao acordar</li><li>Tensão na mandíbula</li></ul>',
      },
      {
        name: 'Problemas Sexuais e Disfunções',
        slug: 'problemas-sexuais-e-disfuncoes',
        icon: 'sparkles',
        order: 7,
        short_description:
          'Tratamento de disfunções sexuais através de hipnose clínica focada em fatores emocionais.',
        detailed_content:
          '<h2>Problemas Sexuais e Disfunções</h2><p>Disfunções sexuais frequentemente têm origem emocional e psicológica, afetando autoestima e relacionamentos.</p><p>A hipnose trabalha na raiz do problema, reprogramando crenças limitantes e reduzindo a ansiedade de performance, restaurando a confiança e o bem-estar sexual.</p>',
        symptoms_list:
          '<ul><li>Perda de libido</li><li>Ansiedade de performance</li><li>Dificuldade de relaxamento</li><li>Crenças limitantes sobre sexualidade</li><li>Impacto nos relacionamentos</li></ul>',
      },
      {
        name: 'TOC e Compulsões',
        slug: 'toc-e-compulsoes',
        icon: 'refresh-cw',
        order: 8,
        short_description: 'Quebra de padrões compulsivos e obsessivos através de hipnose clínica.',
        detailed_content:
          '<h2>TOC e Compulsões</h2><p>O Transtorno Obsessivo-Compulsivo se manifesta através de pensamentos intrusivos e comportamentos repetitivos que prejudicam a rotina.</p><p>A hipnose atua no padrão automático que alimenta o comportamento, identificando gatilhos e reprogramando a resposta para escolhas conscientes.</p>',
        symptoms_list:
          '<ul><li>Pensamentos intrusivos recorrentes</li><li>Necessidade de repetir ações</li><li>Ansiedade quando interrompe o ritual</li><li>Verificação excessiva</li><li>Impacto significativo na rotina</li></ul>',
      },
      {
        name: 'Fibromialgia e Dores Psicossomáticas',
        slug: 'fibromialgia-e-dores-psicossomaticas',
        icon: 'bone',
        order: 9,
        short_description:
          'Gestão de dor crônica e fibromialgia através de técnicas hipnóticas que modulam a percepção da dor.',
        detailed_content:
          '<h2>Fibromialgia e Dores Psicossomáticas</h2><p>A dor crônica é uma condição complexa que afeta tanto o corpo quanto a mente, impactando todas as áreas da vida.</p><p>A hipnose ensina o cérebro a reinterpretar os sinais de dor, utilizando sugestões que promovem relaxamento profundo e alteram a percepção sensorial.</p>',
        symptoms_list:
          '<ul><li>Dor generalizada e persistente</li><li>Fadiga crônica</li><li>Pontos de sensibilidade</li><li>Dificuldade de concentração</li><li>Perturbações do sono</li></ul>',
      },
      {
        name: 'Vícios e Dependências',
        slug: 'vicios-e-dependencias',
        icon: 'ban',
        order: 10,
        short_description:
          'Cessação de vícios e dependências através de hipnose focada em quebra de padrão.',
        detailed_content:
          '<h2>Vícios e Dependências</h2><p>Vícios em substâncias, comportamentos ou tecnologias podem destruir relacionamentos, finanças e saúde.</p><p>Através de sugestões hipnóticas direcionadas, reprogramamos a associação mental que liga o objeto do vício ao prazer, substituindo por sentimentos de independência.</p>',
        symptoms_list:
          '<ul><li>Necessidade incontrolável de uso</li><li>Dificuldade de parar apesar das consequências</li><li>Sintomas de abstinência</li><li>Isolamento social</li><li>Perda de controle</li></ul>',
      },
      {
        name: 'Gagueira, Bloqueios de Comunicação e Timidez',
        slug: 'gagueira-bloqueios-de-comunicacao-e-timidez',
        icon: 'message-circle',
        order: 11,
        short_description:
          'Superação de gagueira, bloqueios de comunicação e timidez através de hipnose clínica.',
        detailed_content:
          '<h2>Gagueira e Bloqueios de Comunicação</h2><p>A gagueira e os bloqueios de comunicação frequentemente têm origem em fatores emocionais e ansiedade social.</p><p>A hipnose trabalha a confiança e o relaxamento, reprogramando padrões de tensão que interferem na fluência da fala e na expressão pessoal.</p>',
        symptoms_list:
          '<ul><li>Dificuldade de iniciar a fala</li><li>Bloqueios ao se comunicar</li><li>Ansiedade em situações sociais</li><li>Medo de julgamento</li><li>Evitação de falar em público</li></ul>',
      },
    ]

    for (var i = 0; i < seeds.length; i++) {
      var seed = seeds[i]
      var existing = null
      try {
        existing = app.findFirstRecordByData('treatment_categories', 'slug', seed.slug)
      } catch (_) {}

      if (existing) {
        existing.set('name', seed.name)
        existing.set('icon', seed.icon)
        existing.set('order', seed.order)
        existing.set('short_description', seed.short_description)
        if (!existing.getString('detailed_content')) {
          existing.set('detailed_content', seed.detailed_content)
        }
        if (!existing.getString('symptoms_list')) {
          existing.set('symptoms_list', seed.symptoms_list)
        }
        app.save(existing)
      } else {
        var rec = new Record(col)
        rec.set('name', seed.name)
        rec.set('slug', seed.slug)
        rec.set('short_description', seed.short_description)
        rec.set('detailed_content', seed.detailed_content)
        rec.set('icon', seed.icon)
        rec.set('symptoms_list', seed.symptoms_list)
        rec.set('order', seed.order)
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('treatment_categories'))
    } catch (_) {}
  },
)
