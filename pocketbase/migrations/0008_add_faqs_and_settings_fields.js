migrate(
  (app) => {
    const faqs = new Collection({
      name: 'faqs',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.is_admin = true',
      updateRule: '@request.auth.is_admin = true',
      deleteRule: '@request.auth.is_admin = true',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'editor', required: true },
        { name: 'category', type: 'text' },
        { name: 'order', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_faqs_order ON faqs (order)'],
    })
    app.save(faqs)

    const settingsCol = app.findCollectionByNameOrId('platform_settings')

    if (!settingsCol.fields.getByName('whatsapp_number')) {
      settingsCol.fields.add(new TextField({ name: 'whatsapp_number' }))
    }
    if (!settingsCol.fields.getByName('instagram_handle')) {
      settingsCol.fields.add(new TextField({ name: 'instagram_handle' }))
    }
    if (!settingsCol.fields.getByName('support_email')) {
      settingsCol.fields.add(new EmailField({ name: 'support_email' }))
    }
    if (!settingsCol.fields.getByName('agenda_highlight_title')) {
      settingsCol.fields.add(new TextField({ name: 'agenda_highlight_title' }))
    }
    if (!settingsCol.fields.getByName('about_content')) {
      settingsCol.fields.add(new EditorField({ name: 'about_content', maxSize: 5242880 }))
    }
    if (!settingsCol.fields.getByName('about_image')) {
      settingsCol.fields.add(
        new FileField({
          name: 'about_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    if (!settingsCol.fields.getByName('home_hero_image')) {
      settingsCol.fields.add(
        new FileField({
          name: 'home_hero_image',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        }),
      )
    }
    app.save(settingsCol)

    var faqSeeds = [
      {
        question: 'Como acesso as aulas ao vivo?',
        answer:
          '<p>Os links para as aulas ao vivo são disponibilizados no m\u00f3dulo correspondente dentro do curso e tamb\u00e9m enviados por e-mail 1h antes do in\u00edcio. Caso perca, a grava\u00e7\u00e3o ficar\u00e1 dispon\u00edvel em at\u00e9 24h na plataforma.</p>',
        category: 'Aulas',
        order: 0,
      },
      {
        question: 'Por quanto tempo tenho acesso aos cursos?',
        answer:
          '<p>A maioria dos nossos cursos, incluindo as Formações Master, possuem acesso vitalício para os alunos. Mentoria e grupos específicos possuem prazos determinados que são informados no ato da compra.</p>',
        category: 'Acesso',
        order: 1,
      },
      {
        question: 'Como funciona o sistema de pontuação e ranking?',
        answer:
          '<p>Você ganha pontos ao assistir aulas completas (10 pts), realizar avaliações (50 pts), participar na comunidade (5 pts por post) e concluir cursos (500 pts). Os top 10 do ranking mensal recebem convites para masterclasses exclusivas.</p>',
        category: 'Plataforma',
        order: 2,
      },
      {
        question: 'Posso baixar as videoaulas?',
        answer:
          '<p>As videoaulas só podem ser assistidas online através da nossa plataforma para garantir a proteção de direitos autorais. No entanto, todos os materiais complementares em PDF, planilhas e áudios de hipnose podem ser baixados livremente.</p>',
        category: 'Aulas',
        order: 3,
      },
      {
        question: 'Como emito meu certificado?',
        answer:
          '<p>Após concluir 100% das aulas e ser aprovado na avaliação final (quando aplicável), o botão "Emitir Certificado" aparecerá na página "Minhas Compras" e também na última aula do curso.</p>',
        category: 'Certificados',
        order: 4,
      },
    ]

    for (var i = 0; i < faqSeeds.length; i++) {
      var seed = faqSeeds[i]
      try {
        app.findFirstRecordByData('faqs', 'question', seed.question)
      } catch (_) {
        var rec = new Record(faqs)
        rec.set('question', seed.question)
        rec.set('answer', seed.answer)
        rec.set('category', seed.category)
        rec.set('order', seed.order)
        app.save(rec)
      }
    }

    var settingsRecord = null
    try {
      var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) settingsRecord = records[0]
    } catch (_) {}

    if (!settingsRecord) {
      settingsRecord = new Record(settingsCol)
    }

    if (!settingsRecord.getString('company_name')) {
      settingsRecord.set('company_name', 'Anderson Abreu')
    }
    if (!settingsRecord.getString('whatsapp_number')) {
      settingsRecord.set('whatsapp_number', '+55 (11) 99999-9999')
    }
    if (!settingsRecord.getString('instagram_handle')) {
      settingsRecord.set('instagram_handle', 'andersonabreu')
    }
    if (!settingsRecord.getString('support_email')) {
      settingsRecord.set('support_email', 'contato@andersonabreu.com.br')
    }
    if (!settingsRecord.getString('agenda_highlight_title')) {
      settingsRecord.set('agenda_highlight_title', 'Eventos e Turmas')
    }
    if (!settingsRecord.getString('about_content')) {
      settingsRecord.set(
        'about_content',
        '<h2>Nossa Metodologia</h2><h3>Muito além da teoria. Uma imersão na prática.</h3><p>Fundado pelo especialista Anderson Abreu, o instituto tem a missão de formar profissionais e indivíduos capacitados com o melhor ensino e prática da hipnoterapia e desenvolvimento humano.</p><p>Nossa metodologia desenvolve o processo de aprendizado de uma maneira fácil e direta, com laboratório de práticas ao vivo e acompanhamento próximo. Somos pioneiros em utilizar tecnologia imersiva nos treinamentos para garantir que você absorva 100% do conteúdo.</p><ul><li>Mentoria ao vivo e orientações direto com especialistas</li><li>A única instituição com estrutura para estágio virtual</li><li>Certificações reconhecidas para atuação profissional</li></ul>',
      )
    }
    if (!settingsRecord.getString('login_text')) {
      settingsRecord.set(
        'login_text',
        'Hipnose, inteligência emocional e mentoria de alta performance',
      )
    }
    if (!settingsRecord.getString('login_gradient')) {
      settingsRecord.set('login_gradient', 'from-blue-900 via-blue-950 to-black')
    }

    var existingJson = settingsRecord.get('landing_page_json')
    if (!existingJson) {
      settingsRecord.set('landing_page_json', {
        home: {
          badge: 'Inscrições abertas para a nova turma',
          title: 'Transforme sua mente.',
          titleHighlight: 'Alcance alta performance.',
          subtitle:
            'Hipnose clínica, inteligência emocional e mentoria de alta performance para quem deseja romper limites, superar bloqueios e alcançar resultados extraordinários na vida pessoal e profissional.',
          primaryButtonText: 'Conheça nossos cursos',
          secondaryButtonText: 'Nossa metodologia',
        },
        stats: [
          { value: '+5k', label: 'Alunos Formados' },
          { value: '+10', label: 'Anos de História' },
          { value: '+7', label: 'Países Alcançados' },
          { value: 'Sim', label: 'Certificação Int.' },
        ],
      })
    }

    app.save(settingsRecord)
  },
  (app) => {
    try {
      var faqsCol = app.findCollectionByNameOrId('faqs')
      app.delete(faqsCol)
    } catch (_) {}

    try {
      var settingsCol = app.findCollectionByNameOrId('platform_settings')
      try {
        settingsCol.fields.removeByName('whatsapp_number')
      } catch (_) {}
      try {
        settingsCol.fields.removeByName('instagram_handle')
      } catch (_) {}
      try {
        settingsCol.fields.removeByName('support_email')
      } catch (_) {}
      try {
        settingsCol.fields.removeByName('agenda_highlight_title')
      } catch (_) {}
      try {
        settingsCol.fields.removeByName('about_content')
      } catch (_) {}
      try {
        settingsCol.fields.removeByName('about_image')
      } catch (_) {}
      try {
        settingsCol.fields.removeByName('home_hero_image')
      } catch (_) {}
      app.save(settingsCol)
    } catch (_) {}
  },
)
