// Remove style='text-align: left' inline do journey_title e journey_text na collection platform_settings
migrate(
  (app) => {
    function stripAlignLeft(html) {
      if (!html) return html
      var out = html
      // Remove text-align: left (com ou sem ponto e vírgula, com aspas simples ou duplas ou inline)
      out = out.replace(/text-align\s*:\s*left\s*;?/gi, '')
      // Remove style="" ou style='' vazios após a remoção
      out = out.replace(/\s*style=["']\s*["']/gi, '')
      return out
    }

    var records = app.findRecordsByFilter('platform_settings', "id != ''", '-created', 100, 0)
    for (var i = 0; i < records.length; i++) {
      var rec = records[i]
      var updated = false

      var jTitle = rec.getString('journey_title')
      if (jTitle) {
        var cleanTitle = stripAlignLeft(jTitle)
        if (cleanTitle !== jTitle) {
          rec.set('journey_title', cleanTitle)
          updated = true
        }
      }

      var jText = rec.getString('journey_text')
      if (jText) {
        var cleanText = stripAlignLeft(jText)
        if (cleanText !== jText) {
          rec.set('journey_text', cleanText)
          updated = true
        }
      }

      if (updated) {
        app.save(rec)
      }
    }
  },
  (app) => {},
)
