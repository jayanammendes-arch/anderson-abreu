migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('crm_leads')

    var seeds = [
      {
        name: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '(11) 99999-1234',
        instagram_handle: 'mariasilva',
        stage: 'Leads externos',
        notes: 'Interessada em hipnose para ansiedade',
      },
      {
        name: 'João Santos',
        email: 'joao.santos@example.com',
        phone: '(11) 98888-5678',
        instagram_handle: 'josantos',
        stage: 'Novos Seguidores',
        notes: '',
      },
      {
        name: 'Ana Costa',
        email: 'ana.costa@example.com',
        phone: '(21) 97777-4321',
        instagram_handle: 'anacosta',
        stage: 'Base',
        notes: 'Ja comprou curso introdutorio',
      },
      {
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@example.com',
        phone: '(31) 96666-8765',
        instagram_handle: 'pedrooliveira',
        stage: 'Conexao',
        notes: 'Agendou sessao',
      },
      {
        name: 'Carla Mendes',
        email: 'carla.mendes@example.com',
        phone: '(41) 95555-1357',
        instagram_handle: 'carlamendes',
        stage: 'Wtz ok Anderson',
        notes: 'Confirmou interesse em mentoria',
      },
      {
        name: 'Roberto Lima',
        email: 'roberto.lima@example.com',
        phone: '(51) 94444-2468',
        instagram_handle: 'robertolima',
        stage: 'Fechado',
        notes: 'Cliente fechado!',
      },
      {
        name: 'Fernanda Souza',
        email: 'fernanda.souza@example.com',
        phone: '(61) 93333-3691',
        instagram_handle: 'fernsouza',
        stage: 'No Show',
        notes: 'Nao compareceu a sessao',
      },
      {
        name: 'Lucas Ferreira',
        email: 'lucas.ferreira@example.com',
        phone: '(71) 92222-2580',
        instagram_handle: 'lucasferreira',
        stage: 'Leads externos',
        notes: 'Veio pelo Instagram',
      },
    ]

    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i]
      try {
        app.findFirstRecordByData('crm_leads', 'email', s.email)
      } catch (_) {
        var record = new Record(col)
        record.set('name', s.name)
        record.set('email', s.email)
        record.set('phone', s.phone)
        record.set('instagram_handle', s.instagram_handle)
        record.set('stage', s.stage)
        record.set('notes', s.notes)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      var records = app.findRecordsByFilter('crm_leads', "id != ''", '', 100, 0)
      for (var i = 0; i < records.length; i++) {
        app.delete(records[i])
      }
    } catch (_) {}
  },
)
