onRecordAfterCreateSuccess((e) => {
  var record = e.record

  if (record.getString('image')) {
    return e.next()
  }

  var order = record.getInt('order') || 1

  var images = [
    'https://img.usecurling.com/p/600/800?q=clinic%20reception',
    'https://img.usecurling.com/p/600/800?q=treatment%20room%20therapy',
    'https://img.usecurling.com/p/600/800?q=certificates%20wall',
    'https://img.usecurling.com/p/600/800?q=therapy%20armchair',
  ]

  var idx = order - 1
  if (idx < 0) idx = 0
  if (idx >= images.length) idx = images.length - 1

  try {
    var file = $filesystem.fileFromURL(images[idx], 30)
    var rec = $app.findRecordById('about_environment_images', record.id)
    rec.set('image', file)
    $app.save(rec)
  } catch (err) {
    console.log('auto env image download failed for record ' + record.id)
  }

  return e.next()
}, 'about_environment_images')
