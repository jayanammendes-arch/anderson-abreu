migrate(
  (app) => {
    const coursesCol = app.findCollectionByNameOrId('courses')
    const modulesCol = app.findCollectionByNameOrId('modules')
    const lessonsCol = app.findCollectionByNameOrId('lessons')

    function findExisting(name, field, value) {
      try {
        return app.findFirstRecordByData(name, field, value)
      } catch (_) {
        return null
      }
    }

    function seedCourse(title, desc, cat, available, order) {
      let rec = findExisting('courses', 'title', title)
      if (!rec) {
        rec = new Record(coursesCol)
        rec.set('title', title)
        rec.set('description', desc)
        rec.set('category', cat)
        rec.set('is_available', available)
        rec.set('order', order)
        rec.set('thumbnail', '')
        app.save(rec)
      }
      return rec
    }

    function seedModule(courseId, title, order) {
      let rec = findExisting('modules', 'title', title)
      if (!rec) {
        rec = new Record(modulesCol)
        rec.set('course', courseId)
        rec.set('title', title)
        rec.set('order', order)
        app.save(rec)
      }
      return rec
    }

    function seedLesson(moduleId, title, videoUrl, duration, order, content) {
      let rec = findExisting('lessons', 'title', title)
      if (!rec) {
        rec = new Record(lessonsCol)
        rec.set('module', moduleId)
        rec.set('title', title)
        rec.set('video_url', videoUrl)
        rec.set('duration', duration)
        rec.set('order', order)
        rec.set('content', content)
        app.save(rec)
      }
      return rec
    }

    var c1 = seedCourse(
      'Mentoria de Lideranca',
      'Desenvolva habilidades de lideranca transformacional e aprenda a inspirar equipes alcancando resultados extraordinarios.',
      'mentoria',
      true,
      1,
    )
    var m1 = seedModule(c1.id, 'Fundamentos da Lideranca', 1)
    seedLesson(
      m1.id,
      'O Papel do Lider Moderno',
      'https://www.youtube.com/embed/iZQxgCkQ7BM',
      '45 min',
      1,
      '<p>Nesta aula, exploramos os fundamentos da lideranca transformacional e o papel do lider no seculo XXI.</p><h3>Topicos abordados</h3><ul><li>O que e lideranca transformacional</li><li>Diferenca entre gestao e lideranca</li><li>Os pilares de um lider moderno</li></ul><p>Ao final, voce compreendera seu papel como lider e como inspirar sua equipe.</p>',
    )
    seedLesson(
      m1.id,
      'Comunicacao Eficaz na Lideranca',
      'https://www.youtube.com/embed/qp0HIF3ztR8',
      '38 min',
      2,
      '<p>A comunicacao e a ferramenta mais poderosa do lider. Aprenda tecnicas para se comunicar com clareza e impacto.</p><h3>Topicos</h3><ul><li>Escuta ativa</li><li>Feedback construtivo</li><li>Comunicacao nao-violenta</li></ul>',
    )
    seedLesson(
      m1.id,
      'Gestao de Conflitos e Tomada de Decisao',
      'https://www.youtube.com/embed/H14bBuluwB8',
      '52 min',
      3,
      '<p>Conflitos sao inevitaveis. Aprenda a gere-los de forma construtiva e a tomar decisoes com confianca.</p><h3>Topicos</h3><ul><li>Tipos de conflito</li><li>Estrategias de mediacao</li><li>Framework para tomada de decisao</li></ul>',
    )

    var c2 = seedCourse(
      'Estrategias de Comunicacao',
      'Aprenda tecnicas avancadas de comunicacao para influenciar, persuadir e criar conexoes autenticas em qualquer situacao.',
      'desenvolvimento',
      true,
      2,
    )
    var m2 = seedModule(c2.id, 'Fundamentos da Comunicacao', 1)
    seedLesson(
      m2.id,
      'A Arte da Escuta Ativa',
      'https://www.youtube.com/embed/eIho2S0ZahI',
      '42 min',
      1,
      '<p>Escutar e mais importante do que falar. Desenvolva a capacidade de escuta ativa transformadora.</p><h3>Topicos</h3><ul><li>Barreiras da escuta</li><li>Tecnicas de escuta ativa</li><li>Empatia na comunicacao</li></ul>',
    )
    seedLesson(
      m2.id,
      'Comunicacao Nao-Violenta na Pratica',
      'https://www.youtube.com/embed/Ks-_Mh1QhMc',
      '35 min',
      2,
      '<p>A CNV de Marshall Rosenberg aplicada ao dia a dia. Aprenda a se expressar sem agredir.</p><h3>Topicos</h3><ul><li>Os 4 passos da CNV</li><li>Identificando necessidades</li><li>Fazendo pedidos claros</li></ul>',
    )
    seedLesson(
      m2.id,
      'Influencia e Persuasao Etica',
      'https://www.youtube.com/embed/fS3ebag0z6U',
      '48 min',
      3,
      '<p>Como influenciar pessoas eticamente. Descubra os principios da persuasao baseada em valores.</p><h3>Topicos</h3><ul><li>Principios da persuasao</li><li>Carisma e presença</li><li>Etica na influencia</li></ul>',
    )

    var c3 = seedCourse(
      'Hipnose Clinica Avancada',
      'Tecnicas avancadas de hipnose clinica para profissionais. Inducoes profundas, trabalho com traumas e etica profissional.',
      'hipnose',
      false,
      3,
    )
    var m3 = seedModule(c3.id, 'Tecnicas Avancadas', 1)
    seedLesson(
      m3.id,
      'Inducoes Profundas',
      'https://www.youtube.com/embed/arj7oStGLkU',
      '55 min',
      1,
      '<p>Dominie as inducoes hipnoticas mais profundas e eficazes para pratica clinica.</p>',
    )
    seedLesson(
      m3.id,
      'Trabalhando com Traumas',
      'https://www.youtube.com/embed/Mg7Rpd0Uj1U',
      '60 min',
      2,
      '<p>Abordagens seguras e eticas para o tratamento de traumas atraves da hipnose.</p>',
    )
    seedLesson(
      m3.id,
      'Etica e Responsabilidade',
      'https://www.youtube.com/embed/ZR40uCA5a5I',
      '40 min',
      3,
      '<p>Os princpios eticos fundamentais para a pratica segura da hipnose clinica.</p>',
    )
  },
  (app) => {
    var names = ['lessons', 'modules', 'courses']
    for (var i = 0; i < names.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(names[i]))
      } catch (_) {}
    }
  },
)
