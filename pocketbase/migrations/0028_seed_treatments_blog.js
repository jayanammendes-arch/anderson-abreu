migrate(
  (app) => {
    const treatmentsCol = app.findCollectionByNameOrId('treatments')
    const blogCol = app.findCollectionByNameOrId('blog_posts')

    const treatmentSeeds = [
      {
        name: 'Ansiedade',
        slug: 'ansiedade',
        short_description:
          'Tratamento eficaz para quadros de ansiedade generalizada, crises de pânico e preocupações excessivas.',
        detailed_content:
          '<h2>O que é Ansiedade</h2><p>A ansiedade é uma resposta natural do corpo, mas quando se torna persistente e desproporcional, pode prejudicar significativamente a qualidade de vida. Através da hipnose clínica, trabalhamos diretamente com o subconsciente para reprogramar padrões de pensamento que alimentam a ansiedade.</p><h3>Como funciona</h3><p>Utilizamos técnicas de sugestão e regressão para identificar a raiz dos gatilhos ansiosos, promovendo um estado de calma profunda e controle emocional. O tratamento é personalizado e respeita o ritmo de cada paciente.</p>',
      },
      {
        name: 'Depressão',
        slug: 'depressao',
        short_description:
          'Abordagem hipnoterapêutica para quadros depressivos, ajudando a resgatar motivação e bem-estar.',
        detailed_content:
          '<h2>Depressão e Hipnose</h2><p>A depressão afeta milhões de pessoas e pode se manifestar de diversas formas. A hipnose clínica oferece uma via complementar de tratamento, atuando nos padrões mentais que perpetuam o estado depressivo.</p><h3>Como funciona</h3><p>Através de sessões estruturadas, ajudamos o paciente a acessar recursos internos de motivação, ressignificar experiências passadas e construir uma visão mais positiva do futuro. O processo é colaborativo e seguro.</p>',
      },
      {
        name: 'Dor Crônica',
        slug: 'dor-cronica',
        short_description:
          'Gestão de dor crônica através de técnicas hipnóticas que modulam a percepção da dor.',
        detailed_content:
          '<h2>Dor Crônica</h2><p>A dor crônica é uma condição complexa que afeta tanto o corpo quanto a mente. A hipnose tem sido amplamente reconhecida pela comunidade científica como uma ferramenta eficaz no manejo da dor.</p><h3>Como funciona</h3><p>Ensinamos o cérebro a reinterpretar os sinais de dor, utilizando sugestões hipnóticas que promovem relaxamento profundo e alteram a percepção sensorial. Muitos pacientes relatam redução significativa na intensidade da dor após poucas sessões.</p>',
      },
      {
        name: 'Fobias',
        slug: 'fobias',
        short_description:
          'Superação de fobias específicas e sociais através de dessensibilização hipnótica.',
        detailed_content:
          '<h2>Fobias</h2><p>Fobias são medos irracionais e intensos que podem limitar drasticamente a vida de uma pessoa. Seja medo de altura, animais, voar ou espaços fechados, a hipnose oferece um caminho rápido e eficaz para superá-los.</p><h3>Como funciona</h3><p>Através de técnicas de dessensibilização sistemática sob hipnose, o paciente é gradualmente exposto ao objeto do medo em um estado de relaxamento profundo, permitindo que o cérebro recondicione sua resposta emocional.</p>',
      },
      {
        name: 'Insônia',
        slug: 'insonia',
        short_description:
          'Tratamento de distúrbios do sono através de hipnose para promover descanso restaurador.',
        detailed_content:
          '<h2>Insônia</h2><p>A insônia afeta a saúde física, mental e emocional. A hipnose clínica é uma das abordagens mais eficazes para restaurar padrões de sono saudáveis, sem o uso de medicamentos.</p><h3>Como funciona</h3><p>Trabalhamos com sugestões que acalmam a mente, reduzem a ruminação noturna e estabelecem um ritual natural de sono. O paciente aprende técnicas de auto-hipnose que pode usar independentemente para garantir noites tranquilas.</p>',
      },
      {
        name: 'Traumas',
        slug: 'traumas',
        short_description:
          'Processamento e superação de traumas emocionais através de terapia regressiva.',
        detailed_content:
          '<h2>Traumas Emocionais</h2><p>Traumas podem deixar marcas profundas que afetam comportamentos, relacionamentos e a saúde mental. A hipnose clínica oferece um caminho seguro para processar e liberar essas experiências.</p><h3>Como funciona</h3><p>Utilizamos técnicas de regressão terapêutica para acessar a memória onde o trauma foi armazenado, permitindo que o paciente ressignifique a experiência e libere a carga emocional associada, tudo em um ambiente seguro e controlado.</p>',
      },
      {
        name: 'Tabagismo',
        slug: 'tabagismo',
        short_description:
          'Cessação do tabagismo em uma única sessão de hipnose focada em quebra de padrão.',
        detailed_content:
          '<h2>Tabagismo</h2><p>Parar de fumar é um dos maiores desafios para muitos, mas a hipnose tem uma taxa de sucesso impressionante neste tratamento, frequentemente resolvendo o problema em uma única sessão.</p><h3>Como funciona</h3><p>Através de sugestões hipnóticas direcionadas, reprogramamos a associação mental que liga o cigarro ao prazer ou alívio, substituindo-a por sentimentos de independência e bem-estar. O método é indolor e duradouro.</p>',
      },
    ]

    for (let i = 0; i < treatmentSeeds.length; i++) {
      const seed = treatmentSeeds[i]
      try {
        app.findFirstRecordByData('treatments', 'slug', seed.slug)
      } catch (_) {
        const rec = new Record(treatmentsCol)
        rec.set('name', seed.name)
        rec.set('slug', seed.slug)
        rec.set('short_description', seed.short_description)
        rec.set('detailed_content', seed.detailed_content)
        rec.set('order', i)
        app.save(rec)
      }
    }

    const blogSeeds = [
      {
        title: 'Hipnose Clínica: O que a ciência diz',
        slug: 'hipnose-clinica-o-que-a-ciencia-diz',
        excerpt:
          'Entenda como a hipnose clínica é validada por estudos científicos e por que ela é uma ferramenta terapêutica poderosa.',
        content:
          '<p>A hipnose clínica tem ganhado reconhecimento crescente na comunidade científica. Estudos publicados em revistas de renome demonstram sua eficácia em uma ampla gama de condições, desde ansiedade até gestão de dor crônica.</p><h2>O que é hipnose clínica?</h2><p>A hipnose clínica é um estado de foco intensificado e relaxamento profundo, no qual a mente subconsciente se torna mais receptiva a sugestões positivas. Diferente do que se vê em palcos, a hipnose terapêutica é um processo colaborativo.</p><h2>Evidências científicas</h2><p>Pesquisas mostram que a hipnose pode modificar a atividade cerebral em áreas relacionadas à percepção da dor, controle emocional e memória. Um meta-análise de 2023 confirmou sua eficácia no tratamento de ansiedade e fobias.</p>',
        author: 'Anderson Abreu',
      },
      {
        title: '5 mitos sobre hipnose que você precisa esquecer',
        slug: '5-mitos-sobre-hipnose-que-voce-precisa-esquecer',
        excerpt:
          'Desvendamos os maiores mitos sobre hipnose e mostramos a realidade por trás dessa técnica terapêutica.',
        content:
          '<p>A hipnose é cercada de mistérios e mitos. Vamos desmistificar os mais comuns:</p><h2>1. Você perde o controle</h2><p>Mito. Na hipnose clínica, você permanece totalmente consciente e no controle. Ninguém pode fazer você fazer algo que não deseja.</p><h2>2. Hipnose é o mesmo que sono</h2><p>Mito. A hipnose é um estado de foco intensificado, não de sono. Você ouve tudo e pode responder.</p><h2>3. Só pessoas fracas são hipnotizáveis</h2><p>Mito. Na verdade, pessoas com maior capacidade de concentração tendem a ser mais responsivas à hipnose.</p>',
        author: 'Anderson Abreu',
      },
      {
        title: 'Como a inteligência emocional transforma relacionamentos',
        slug: 'como-a-inteligencia-emocional-transforma-relacionamentos',
        excerpt:
          'Descubra como desenvolver sua inteligência emocional pode revolucionar seus relacionamentos pessoais e profissionais.',
        content:
          '<p>A inteligência emocional é a capacidade de reconhecer, entender e gerenciar suas próprias emoções e as dos outros. É uma habilidade que pode ser desenvolvida e que tem impacto profundo em todos os aspectos da vida.</p><h2>Por que importa?</h2><p>Pessoas com alta inteligência emocional tendem a ter relacionamentos mais saudáveis, melhor performance no trabalho e maior bem-estar geral.</p><h2>Como desenvolver</h2><p>A hipnose clínica pode acelerar o desenvolvimento da inteligência emocional, ajudando a acessar e reprogramar padrões emocionais profundamente enraizados.</p>',
        author: 'Anderson Abreu',
      },
    ]

    for (let i = 0; i < blogSeeds.length; i++) {
      const seed = blogSeeds[i]
      try {
        app.findFirstRecordByData('blog_posts', 'slug', seed.slug)
      } catch (_) {
        const rec = new Record(blogCol)
        rec.set('title', seed.title)
        rec.set('slug', seed.slug)
        rec.set('excerpt', seed.excerpt)
        rec.set('content', seed.content)
        rec.set('author', seed.author)
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      const treatments = app.findRecordsByFilter('treatments', "id != ''", '', 0, 0)
      for (let i = 0; i < treatments.length; i++) app.delete(treatments[i])
    } catch (_) {}
    try {
      const posts = app.findRecordsByFilter('blog_posts', "id != ''", '', 0, 0)
      for (let i = 0; i < posts.length; i++) app.delete(posts[i])
    } catch (_) {}
  },
)
