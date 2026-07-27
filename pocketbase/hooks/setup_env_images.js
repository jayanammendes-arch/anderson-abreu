routerAdd(
  'GET',
  '/backend/v1/setup-env-images',
  (e) => {
    var isAdmin = false
    try {
      isAdmin = e.auth && e.auth.getBool ? e.auth.getBool('is_admin') : false
    } catch (_) {}
    if (!e.hasSuperuserAuth() && !isAdmin) {
      return e.forbiddenError('Admin access required')
    }

    var images = [
      'https://img.usecurling.com/p/600/800?q=clinic%20reception',
      'https://img.usecurling.com/p/600/800?q=treatment%20room%20therapy',
      'https://img.usecurling.com/p/600/800?q=certificates%20wall',
      'https://img.usecurling.com/p/600/800?q=therapy%20armchair',
    ]

    var records = []
    try {
      records = $app.findRecordsByFilter('about_environment_images', "id != ''", 'order', 100, 0)
    } catch (err) {
      return e.json(500, { error: 'Failed to fetch records: ' + err.message })
    }

    var results = []

    for (var i = 0; i < records.length && i < images.length; i++) {
      try {
        var file = $filesystem.fileFromURL(images[i], 30)
        records[i].set('image', file)
        $app.save(records[i])
        results.push({ order: i + 1, status: 'ok' })
      } catch (err) {
        results.push({ order: i + 1, status: 'error', message: err.message })
      }
    }

    return e.json(200, { results: results })
  },
  $apis.requireAuth(),
)
