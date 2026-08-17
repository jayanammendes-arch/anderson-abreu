// Adiciona o campo JSON `heading_sizes` à collection `treatment_categories`.
// Esse campo guarda os tamanhos (px) de cada nível de heading (h1..h6) que o
// administrador configura manualmente na tela de Editar Categoria, separando
// mobile e desktop. O CSS dinâmico injetado na página pública de tratamento
// usa esses valores para sobrepor o CSS global (que força todos os headings
// iguais). Mantém como fallback a tabela padrão:
//   h1 32/38, h2 26/30, h3 22/24, h4 18/20, h5 16/18, h6 14/16.
migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('heading_sizes')) {
      col.fields.add(new JSONField({ name: 'heading_sizes', maxSize: 5242880 }))
    }

    app.save(col)

    // Valor padrão (fallback) aplicado a todos os registros existentes que ainda
    // não possuem `heading_sizes` configurado.
    var defaultSizes = {
      h1: { mobile: 32, desktop: 38 },
      h2: { mobile: 26, desktop: 30 },
      h3: { mobile: 22, desktop: 24 },
      h4: { mobile: 18, desktop: 20 },
      h5: { mobile: 16, desktop: 18 },
      h6: { mobile: 14, desktop: 16 },
    }

    var records = app.findRecordsByFilter('treatment_categories', '', '', 200, 0)
    records.forEach(function (rec) {
      var raw = rec.getString('heading_sizes')
      if (!raw || raw === '' || raw === '{}' || raw === 'null') {
        rec.set('heading_sizes', JSON.stringify(defaultSizes))
        app.save(rec)
      }
    })
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')
    try {
      col.fields.removeByName('heading_sizes')
    } catch (_) {}
    app.save(col)
  },
)
