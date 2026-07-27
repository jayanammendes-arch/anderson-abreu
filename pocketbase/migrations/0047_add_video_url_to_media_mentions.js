migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('about_media_mentions')
    if (!col.fields.getByName('video_url')) {
      col.fields.add(new URLField({ name: 'video_url', required: false }))
      app.save(col)
    }

    var mediaVideoUrls = [
      'https://www.youtube.com/watch?v=2V5H5qZ9q3E',
      'https://www.youtube.com/watch?v=4k9l3Y3pYc8',
      'https://www.youtube.com/watch?v=7Q0Ih6qU0Yk',
    ]

    var mediaTitles = [
      'Entrevista sobre Hipnose no Programa Mais Você',
      'Reportagem na Revista Veja',
      'Podcast Hipnose na Prática',
    ]

    try {
      var mediaRecs = app.findRecordsByFilter('about_media_mentions', "id != ''", 'order', 100, 0)
      for (var i = 0; i < mediaRecs.length; i++) {
        var rec = mediaRecs[i]
        if (!rec.getString('video_url')) {
          var urlIndex = i < mediaVideoUrls.length ? i : 0
          rec.set('video_url', mediaVideoUrls[urlIndex])
          app.save(rec)
        }
      }
    } catch (_) {}

    var recVideoUrls = [
      'https://www.youtube.com/watch?v=9i2OQq1qKqE',
      'https://www.youtube.com/watch?v=5p6I3qY0pYk',
    ]

    try {
      var recRecs = app.findRecordsByFilter('about_recommendations', "id != ''", 'order', 100, 0)
      for (var j = 0; j < recRecs.length; j++) {
        var rRec = recRecs[j]
        var urlIdx = j < recVideoUrls.length ? j : 0
        rRec.set('video_url', recVideoUrls[urlIdx])
        app.save(rRec)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('about_media_mentions')
      try {
        col.fields.removeByName('video_url')
      } catch (_) {}
      app.save(col)
    } catch (_) {}
  },
)
