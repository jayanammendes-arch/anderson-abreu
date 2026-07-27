migrate(
  (app) => {
    var settingsRec = null
    try {
      var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 1, 0)
      if (records.length > 0) settingsRec = records[0]
    } catch (_) {}

    if (settingsRec) {
      var heroTitle = settingsRec.getString('about_hero_title')
      if (!heroTitle) {
        settingsRec.set('about_hero_title', 'Anderson Abreu')
        settingsRec.set('about_hero_subtitle', 'Referência Nacional em Hipnoterapia Clínica')
      }

      var journeyTitle = settingsRec.getString('about_journey_title')
      if (!journeyTitle) {
        settingsRec.set('about_journey_title', 'Minha Jornada de Sucesso')
        settingsRec.set(
          'about_intro',
          "Desde 2010, Anderson Abreu atua como hipnoterapeuta clínico, ajudando milhares de pacientes a superarem traumas, fobias e ansiedade. Formado pelo Instituto Brasileiro de Hipnose (IBH), é também palestrante internacional e autor do livro 'O Poder da Mente Consciente'.",
        )
      }

      var formationsTitle = settingsRec.getString('about_formations_title')
      if (!formationsTitle) {
        settingsRec.set('about_formations_title', 'Minhas Formações')
        settingsRec.set(
          'about_formations_list',
          JSON.stringify([
            { text: 'Mestrado em Psicologia Clínica – USP' },
            { text: 'Especialização em Hipnose Ericksoniana – IBH' },
            { text: 'Curso de Hipnose Clássica – Sociedade Brasileira de Hipnose' },
            { text: 'Certificação em PNL – Instituto de Neurolinguística' },
            { text: 'Formação em Terapia Cognitivo-Comportamental – PUC-SP' },
          ]),
        )
      }

      settingsRec.set('about_hero_visible', true)
      settingsRec.set('about_credentials_visible', true)
      settingsRec.set('about_journey_visible', true)
      settingsRec.set('about_formations_visible', true)
      settingsRec.set('about_grand_names_visible', true)
      settingsRec.set('about_media_visible', true)
      settingsRec.set('about_recommendations_visible', true)
      settingsRec.set('about_environment_visible', true)

      var ctaTitle = settingsRec.getString('about_cta_title')
      if (!ctaTitle) {
        settingsRec.set('about_cta_title', 'Vamos conversar?')
        settingsRec.set(
          'about_cta_subtitle',
          'Agende sua sessão de hipnoterapia e descubra o poder da sua mente',
        )
        settingsRec.set('about_cta_button_text', 'Agende sua sessão')
        settingsRec.set('about_cta_button_link', '/contato')
      }

      settingsRec.set('about_cta_visible', true)

      settingsRec.set(
        'about_grand_names_title',
        settingsRec.getString('about_grand_names_title') || 'Com Grandes Nomes da Hipnoterapia',
      )
      settingsRec.set('about_media_title', settingsRec.getString('about_media_title') || 'Na Mídia')
      settingsRec.set(
        'about_recommendations_title',
        settingsRec.getString('about_recommendations_title') || 'Quem Recomenda',
      )
      settingsRec.set(
        'about_environment_title',
        settingsRec.getString('about_environment_title') || 'Nosso Ambiente',
      )

      app.save(settingsRec)
    }

    var grandNamesData = [
      {
        name: 'Milton H. Erickson',
        description:
          'Pioneiro da hipnose ericksoniana, principal referência na abordagem indireta.',
        order: 1,
      },
      {
        name: 'Dave Elman',
        description: 'Criador do método Elman de hipnose, amplamente utilizado em hipnose clínica.',
        order: 2,
      },
      {
        name: 'James Braid',
        description: 'Médico e pioneiro, considerado o pai da hipnose moderna.',
        order: 3,
      },
      {
        name: 'John Kappas',
        description: 'Fundador da Hipnose Clínica no Ocidente e criador da Theory of Mind.',
        order: 4,
      },
    ]

    try {
      var grandNamesCol = app.findCollectionByNameOrId('about_grand_names')
      for (var i = 0; i < grandNamesData.length; i++) {
        var g = grandNamesData[i]
        try {
          app.findFirstRecordByData('about_grand_names', 'name', g.name)
        } catch (_) {
          var gnRec = new Record(grandNamesCol)
          gnRec.set('name', g.name)
          gnRec.set('description', g.description)
          gnRec.set('order', g.order)
          gnRec.set('image', '')
          app.save(gnRec)
        }
      }
    } catch (_) {}

    var mediaData = [
      {
        title: 'Entrevista sobre Hipnose no Programa Mais Você',
        description: 'Anderson Abreu explica como a hipnose clínica pode tratar ansiedade.',
        link: 'https://www.youtube.com/watch?v=example1',
        order: 1,
      },
      {
        title: 'Reportagem na Revista Veja',
        description: "Matéria de capa: 'A revolução da hipnoterapia no Brasil'.",
        link: 'https://veja.abril.com.br/saude/hipnoterapia',
        order: 2,
      },
      {
        title: 'Podcast Hipnose na Prática',
        description: 'Episódio 47: Anderson Abreu fala sobre mitos e verdades da hipnose.',
        link: 'https://open.spotify.com/episode/example2',
        order: 3,
      },
    ]

    try {
      var mediaCol = app.findCollectionByNameOrId('about_media_mentions')
      for (var j = 0; j < mediaData.length; j++) {
        var m = mediaData[j]
        try {
          app.findFirstRecordByData('about_media_mentions', 'title', m.title)
        } catch (_) {
          var mRec = new Record(mediaCol)
          mRec.set('title', m.title)
          mRec.set('description', m.description)
          mRec.set('link', m.link)
          mRec.set('order', m.order)
          app.save(mRec)
        }
      }
    } catch (_) {}

    var recsData = [
      {
        video_url: 'https://www.youtube.com/watch?v=recommend1',
        description: 'Depoimento do Dr. Carlos Silva sobre a atuação de Anderson Abreu.',
        order: 1,
      },
      {
        video_url: 'https://www.youtube.com/watch?v=recommend2',
        description: 'Recomendação da psicóloga Fernanda Lima, parceira de longa data.',
        order: 2,
      },
    ]

    try {
      var recsCol = app.findCollectionByNameOrId('about_recommendations')
      for (var k = 0; k < recsData.length; k++) {
        var r = recsData[k]
        try {
          app.findFirstRecordByData('about_recommendations', 'video_url', r.video_url)
        } catch (_) {
          var rRec = new Record(recsCol)
          rRec.set('video_url', r.video_url)
          rRec.set('description', r.description)
          rRec.set('order', r.order)
          app.save(rRec)
        }
      }
    } catch (_) {}

    try {
      var envCol = app.findCollectionByNameOrId('about_environment_images')
      var existingEnv = []
      try {
        existingEnv = app.findRecordsByFilter(
          'about_environment_images',
          "id != ''",
          'order',
          100,
          0,
        )
      } catch (_) {}
      if (existingEnv.length === 0) {
        for (var e = 1; e <= 3; e++) {
          var envRec = new Record(envCol)
          envRec.set('order', e)
          envRec.set('image', '')
          app.save(envRec)
        }
      }
    } catch (_) {}

    try {
      var certCol = app.findCollectionByNameOrId('certification_logos')
      var existingCerts = []
      try {
        existingCerts = app.findRecordsByFilter('certification_logos', "id != ''", 'order', 100, 0)
      } catch (_) {}
      if (existingCerts.length === 0) {
        for (var c = 1; c <= 5; c++) {
          var certRec = new Record(certCol)
          certRec.set('order', c)
          app.save(certRec)
        }
      }
    } catch (_) {}
  },
  (app) => {
    var grandNamesData = ['Milton H. Erickson', 'Dave Elman', 'James Braid', 'John Kappas']
    for (var i = 0; i < grandNamesData.length; i++) {
      try {
        var rec = app.findFirstRecordByData('about_grand_names', 'name', grandNamesData[i])
        app.delete(rec)
      } catch (_) {}
    }

    var mediaTitles = [
      'Entrevista sobre Hipnose no Programa Mais Você',
      'Reportagem na Revista Veja',
      'Podcast Hipnose na Prática',
    ]
    for (var j = 0; j < mediaTitles.length; j++) {
      try {
        var mRec = app.findFirstRecordByData('about_media_mentions', 'title', mediaTitles[j])
        app.delete(mRec)
      } catch (_) {}
    }

    var recUrls = [
      'https://www.youtube.com/watch?v=recommend1',
      'https://www.youtube.com/watch?v=recommend2',
    ]
    for (var k = 0; k < recUrls.length; k++) {
      try {
        var rRec = app.findFirstRecordByData('about_recommendations', 'video_url', recUrls[k])
        app.delete(rRec)
      } catch (_) {}
    }

    try {
      var envRecs = app.findRecordsByFilter('about_environment_images', "id != ''", 'order', 100, 0)
      for (var e = 0; e < envRecs.length; e++) app.delete(envRecs[e])
    } catch (_) {}

    try {
      var certRecs = app.findRecordsByFilter('certification_logos', "id != ''", 'order', 100, 0)
      if (certRecs.length <= 5) {
        for (var c = 0; c < certRecs.length; c++) app.delete(certRecs[c])
      }
    } catch (_) {}
  },
)
