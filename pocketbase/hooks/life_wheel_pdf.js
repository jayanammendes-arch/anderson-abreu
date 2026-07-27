routerAdd(
  'GET',
  '/backend/v1/life-wheel/assessments/{id}/pdf',
  (e) => {
    var id = e.request.pathValue('id')
    var userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')

    var assessment = $app.findRecordById('life_wheel_assessments', id)
    var aUserId = assessment.getString('user')
    var isAdmin = false
    try {
      isAdmin = e.auth.getBool('is_admin')
    } catch (_) {}
    if (aUserId !== userId && !isAdmin && !e.hasSuperuserAuth())
      return e.forbiddenError('Access denied')

    var user = $app.findRecordById('users', aUserId)
    var userName = user.getString('name') || 'Aluno'
    var aType = assessment.getString('type')
    var typeLabel = aType === 'pre' ? 'Pré-Tratamento' : 'Pós-Tratamento'
    var aDate = assessment.getString('date') || assessment.getString('created') || ''
    var scoresStr = assessment.getString('scores')
    var scores = {}
    try {
      scores = JSON.parse(scoresStr)
    } catch (_) {}
    var overall = scores.overall_average || 0

    var cats = []
    try {
      cats = $app.findRecordsByFilter('life_wheel_categories', "id != ''", 'order', 0, 0)
    } catch (_) {}

    var numCats = cats.length
    var cx = 230,
      cy = 330,
      maxR = 160
    var W = 842,
      H = 595

    var esc = function (s) {
      return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    }
    var tw = function (text, factor, size) {
      return text.length * factor * size
    }
    var center = function (text, factor, size) {
      return (W - tw(text, factor, size)) / 2
    }
    var textBlock = function (font, size, r, g, b, x, y, text) {
      return (
        'BT\n/' +
        font +
        ' ' +
        size +
        ' Tf\n' +
        r +
        ' ' +
        g +
        ' ' +
        b +
        ' rg\n1 0 0 1 ' +
        x +
        ' ' +
        y +
        ' Tm\n(' +
        esc(text) +
        ') Tj\nET\n'
      )
    }

    var cs = ''
    cs += '1 1 1 rg\n0 0 ' + W + ' ' + H + ' re f\n'

    cs += textBlock(
      'F2',
      22,
      0.11,
      0.11,
      0.15,
      center('Roda da Vida', 0.5, 22),
      540,
      'Roda da Vida',
    )
    cs += textBlock(
      'F1',
      12,
      0.3,
      0.3,
      0.35,
      center(userName + ' — ' + typeLabel, 0.5, 12),
      515,
      userName + ' — ' + typeLabel,
    )
    var dateDisplay = aDate ? aDate.substring(0, 10) : ''
    cs += textBlock(
      'F1',
      10,
      0.4,
      0.4,
      0.45,
      center('Data: ' + dateDisplay, 0.5, 10),
      500,
      'Data: ' + dateDisplay,
    )

    var i, angle, x, y, r, level, path
    for (level = 2; level <= 10; level += 2) {
      r = (level / 10) * maxR
      path = ''
      for (i = 0; i < numCats; i++) {
        angle = ((-90 + i * (360 / numCats)) * Math.PI) / 180
        x = cx + r * Math.cos(angle)
        y = cy + r * Math.sin(angle)
        path +=
          i === 0
            ? x.toFixed(1) + ' ' + y.toFixed(1) + ' m'
            : ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' l'
      }
      cs += '0.8 0.8 0.85 RG\n0.5 w\n' + path + ' h S\n'
    }

    for (i = 0; i < numCats; i++) {
      angle = ((-90 + i * (360 / numCats)) * Math.PI) / 180
      x = cx + maxR * Math.cos(angle)
      y = cy + maxR * Math.sin(angle)
      cs +=
        '0.8 0.8 0.85 RG\n0.5 w\n' +
        cx +
        ' ' +
        cy +
        ' m ' +
        x.toFixed(1) +
        ' ' +
        y.toFixed(1) +
        ' l S\n'
    }

    var scorePath = ''
    var catNames = []
    var catScores = []
    for (i = 0; i < numCats; i++) {
      var cat = cats[i]
      var catName = cat.getString('name')
      var catScore = scores[cat.id] || 0
      catNames.push(catName)
      catScores.push(catScore)
      r = (catScore / 10) * maxR
      angle = ((-90 + i * (360 / numCats)) * Math.PI) / 180
      x = cx + r * Math.cos(angle)
      y = cy + r * Math.sin(angle)
      scorePath +=
        i === 0
          ? x.toFixed(1) + ' ' + y.toFixed(1) + ' m'
          : ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' l'
    }
    cs += '0.2 0.5 0.9 rg\n' + scorePath + ' h f\n'
    cs += '0.1 0.3 0.7 RG\n1.5 w\n' + scorePath + ' h S\n'

    for (i = 0; i < numCats; i++) {
      angle = ((-90 + i * (360 / numCats)) * Math.PI) / 180
      var labelR = maxR + 22
      x = cx + labelR * Math.cos(angle)
      y = cy + labelR * Math.sin(angle)
      var label = catNames[i].substring(0, 10)
      var lx = x - tw(label, 0.5, 7) / 2
      cs += textBlock('F1', 7, 0.2, 0.2, 0.25, lx.toFixed(1), y.toFixed(1), label)
    }

    var tableX = 470,
      tableY = 460
    cs += textBlock('F2', 13, 0.11, 0.11, 0.15, tableX, tableY, 'Pontuações por Categoria')
    tableY -= 22
    cs += '0.9 0.9 0.93 rg\n' + tableX + ' ' + (tableY - 4) + ' 320 16 re f\n'
    cs += textBlock('F2', 9, 0.2, 0.2, 0.25, tableX + 8, tableY, 'Categoria')
    cs += textBlock('F2', 9, 0.2, 0.2, 0.25, tableX + 260, tableY, 'Nota')
    tableY -= 18
    for (i = 0; i < numCats; i++) {
      if (i % 2 === 0) {
        cs += '0.96 0.96 0.98 rg\n' + tableX + ' ' + (tableY - 2) + ' 320 16 re f\n'
      }
      cs += textBlock('F1', 9, 0.2, 0.2, 0.25, tableX + 8, tableY, catNames[i])
      var scoreStr = catScores[i].toFixed(1)
      cs += textBlock('F1', 9, 0.2, 0.2, 0.25, tableX + 268, tableY, scoreStr)
      tableY -= 16
    }
    tableY -= 10
    cs += '0.85 0.85 0.9 rg\n' + tableX + ' ' + (tableY - 4) + ' 320 18 re f\n'
    cs += textBlock('F2', 10, 0.11, 0.11, 0.15, tableX + 8, tableY, 'Média Geral')
    cs += textBlock('F2', 10, 0.11, 0.11, 0.15, tableX + 268, tableY, overall.toFixed(1))

    cs += textBlock('F1', 7, 0.5, 0.5, 0.55, 40, 30, 'Anderson Abreu — Roda da Vida')

    var objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
        W +
        ' ' +
        H +
        '] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
      '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    ]

    var pdf = '%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n'
    var offsets = []
    for (i = 0; i < objs.length; i++) {
      offsets.push(pdf.length)
      pdf += i + 1 + ' 0 obj\n' + objs[i] + '\nendobj\n'
    }
    var xrefOff = pdf.length
    pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n'
    for (var j = 0; j < offsets.length; j++) {
      var off = '0000000000' + offsets[j]
      pdf += off.substring(off.length - 10) + ' 00000 n \n'
    }
    pdf +=
      'trailer\n<< /Size ' +
      (objs.length + 1) +
      ' /Root 1 0 R >>\nstartxref\n' +
      xrefOff +
      '\n%%EOF'

    var bytes = new Uint8Array(pdf.length)
    for (var k = 0; k < pdf.length; k++) {
      bytes[k] = pdf.charCodeAt(k) & 0xff
    }
    return e.blob(200, 'application/pdf', bytes)
  },
  $apis.requireAuth(),
)
