migrate(
  (app) => {
    // 1. New Collection: events
    const events = new Collection({
      name: 'events',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'date', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'location', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['presencial', 'online'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(events)

    // 2. New Collection: contact_submissions
    const contactSubmissions = new Collection({
      name: 'contact_submissions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'message', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(contactSubmissions)

    // 3. Update Existing courses collection
    const coursesCol = app.findCollectionByNameOrId('courses')
    if (!coursesCol.fields.getByName('price')) {
      coursesCol.fields.add(new NumberField({ name: 'price' }))
    }
    if (!coursesCol.fields.getByName('discount_price')) {
      coursesCol.fields.add(new NumberField({ name: 'discount_price' }))
    }
    if (!coursesCol.fields.getByName('external_buy_url')) {
      coursesCol.fields.add(new URLField({ name: 'external_buy_url' }))
    }
    if (!coursesCol.fields.getByName('short_description')) {
      coursesCol.fields.add(new TextField({ name: 'short_description' }))
    }

    // Set the view/list rules for courses to be public
    coursesCol.listRule = ''
    coursesCol.viewRule = ''
    app.save(coursesCol)

    // 4. Seed Data: Events
    const e1 = new Record(events)
    e1.set('title', 'Imersão em Hipnose Clínica')
    e1.set('date', '2026-10-15T09:00:00Z')
    e1.set('description', 'Um final de semana de imersão total em técnicas avançadas.')
    e1.set('location', 'Tucuruvi, SP')
    e1.set('type', 'presencial')
    app.save(e1)

    const e2 = new Record(events)
    e2.set('title', 'Workshop Inteligência Emocional')
    e2.set('date', '2026-11-05T19:00:00Z')
    e2.set('description', 'Aprenda a gerenciar suas emoções e tomar melhores decisões.')
    e2.set('location', 'Online via Zoom')
    e2.set('type', 'online')
    app.save(e2)

    // 5. Seed Data: Courses
    const courseMocks = [
      {
        title: 'Formação Master em Hipnose Clínica',
        price: 1997,
        discount_price: 1497,
        external_buy_url: 'https://example.com/buy/1',
        short_description: 'Domine a hipnose clínica com a formação mais completa do mercado.',
      },
      {
        title: 'Curso de Inteligência Emocional',
        price: 497,
        discount_price: 297,
        external_buy_url: 'https://example.com/buy/2',
        short_description: 'Desenvolva sua IE para alcançar resultados extraordinários.',
      },
      {
        title: 'Mentoria de Alta Performance',
        price: 2997,
        discount_price: 2997,
        external_buy_url: 'https://example.com/buy/3',
        short_description: 'Acompanhamento direto para elevar seus resultados ao máximo.',
      },
      {
        title: 'Auto-Hipnose Terapêutica',
        price: 197,
        discount_price: 97,
        external_buy_url: 'https://example.com/buy/4',
        short_description: 'Aprenda a reprogramar sua própria mente.',
      },
      {
        title: 'PNL 2.0',
        price: 997,
        discount_price: 697,
        external_buy_url: 'https://example.com/buy/5',
        short_description: 'Programação Neurolinguística avançada para comunicação e influência.',
      },
    ]

    for (const mock of courseMocks) {
      try {
        app.findFirstRecordByData('courses', 'title', mock.title)
      } catch (_) {
        const rec = new Record(coursesCol)
        rec.set('title', mock.title)
        rec.set('price', mock.price)
        rec.set('discount_price', mock.discount_price)
        rec.set('external_buy_url', mock.external_buy_url)
        rec.set('short_description', mock.short_description)
        rec.set('category', 'formacao')
        rec.set('is_available', true)
        rec.set('order', 10)
        app.save(rec)
      }
    }
  },
  (app) => {
    const events = app.findCollectionByNameOrId('events')
    app.delete(events)

    const contactSubmissions = app.findCollectionByNameOrId('contact_submissions')
    app.delete(contactSubmissions)

    const coursesCol = app.findCollectionByNameOrId('courses')
    coursesCol.fields.removeByName('price')
    coursesCol.fields.removeByName('discount_price')
    coursesCol.fields.removeByName('external_buy_url')
    coursesCol.fields.removeByName('short_description')
    coursesCol.listRule = "@request.auth.id != ''"
    coursesCol.viewRule = "@request.auth.id != ''"
    app.save(coursesCol)
  },
)
