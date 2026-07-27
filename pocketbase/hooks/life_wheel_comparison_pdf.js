routerAdd(
  'GET',
  '/backend/v1/life-wheel/compare/{preId}/{postId}/pdf',
  (e) => {
    var preId = e.request.pathValue('preId')
    var postId = e.request.pathValue('postId')
    var userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')

    var ass1 = $app.findRecordById('life_wheel_assessments', preId)
    var ass2 = $app.findRecordById('life_wheel_assessments', postId)
    var u1 = ass1.getString('user')
    var u2 = ass2.getString('user')
    var isAdmin = false
    try {
      isAdmin = e.auth.getBool('is_admin')
    } catch (_) {}
    if ((u1 !== userId || u2 !== userId) && !isAdmin && !e.hasSuperuserAuth())
      return e.forbiddenError('Access denied')

    var user = $app.findRecordById('users', u1)
    var userName = user.getString('name') || 'Aluno'
    var s1 = {},
      s2 = {}
    try {
      s1 = JSON.parse(ass1.getString('scores'))
    } catch (_) {}
    try {
      s2 = JSON.parse(ass2.getString('scores'))
    } catch (_) {}

    var cats = []
    try {
      cats = $app.findRecordsByFilter('life_wheel_categories', "id != ''", 'order', 0, 0)
    } catch (_) {}
    var numCats = cats.length
    var cx = 230,
      cy = 330,
      maxR = 160,
      W = 842,
      H = 595

    var esc = function (s) {
      return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    }
    var tw = function (t, f, s) {
      return t.length * f * s
    }
    var ctr = function (t, f, s) {
      return (W - tw(t, f, s)) / 2
    }
    var tb = function (fn, sz, r, g, b, x, y, t) {
      return (
        'BT\n/' +
        fn +
        ' ' +
        sz +
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
        esc(t) +
        ') Tj\nET\n'
      )
    }

    var cs = '1 1 1 rg\n0 0 ' + W + ' ' + H + ' re f\n'
    cs += tb(
      'F2',
      20,
      0.11,
      0.11,
      0.15,
      ctr('Comparação Pré vs Pós', 0.5, 20),
      540,
      'Comparação Pré vs Pós',
    )
    cs += tb('F1', 12, 0.3, 0.3, 0.35, ctr(userName, 0.5, 12), 515, userName)

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

    var drawPoly = function (scores, fillR, fillG, fillB, strokeR, strokeG, strokeB) {
      var p = ''
      for (i = 0; i < numCats; i++) {
        r = ((scores[cats[i].id] || 0) / 10) * maxR
        angle = ((-90 + i * (360 / numCats)) * Math.PI) / 180
        x = cx + r * Math.cos(angle)
        y = cy + r * Math.sin(angle)
        p +=
          i === 0
            ? x.toFixed(1) + ' ' + y.toFixed(1) + ' m'
            : ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' l'
      }
      cs += fillR + ' ' + fillG + ' ' + fillB + ' rg\n' + p + ' h f\n'
      cs += strokeR + ' ' + strokeG + ' ' + strokeB + ' RG\n1.5 w\n' + p + ' h S\n'
    }
    drawPoly(s1, 0.2, 0.5, 0.9, 0.1, 0.3, 0.7)
    drawPoly(s2, 0.2, 0.7, 0.4, 0.1, 0.5, 0.2)

    for (i = 0; i < numCats; i++) {
      angle = ((-90 + i * (360 / numCats)) * Math.PI) / 180
      var labelR = maxR + 22
      x = cx + labelR * Math.cos(angle)
      y = cy + labelR * Math.sin(angle)
      var label = cats[i].getString('name').substring(0, 10)
      cs += tb('F1', 7, 0.2, 0.2, 0.25, (x - tw(label, 0.5, 7) / 2).toFixed(1), y.toFixed(1), label)
    }

    var tx = 470,
      ty = 460
    cs += tb('F2', 13, 0.11, 0.11, 0.15, tx, ty, 'Comparação de Pontuações')
    ty -= 22
    cs += '0.9 0.9 0.93 rg\n' + tx + ' ' + (ty - 4) + ' 320 16 re f\n'
    cs += tb('F2', 9, 0.2, 0.2, 0.25, tx + 8, ty, 'Categoria')
    cs += tb('F2', 9, 0.3, 0.3, 0.85, tx + 210, ty, 'Pré')
    cs += tb('F2', 9, 0.2, 0.6, 0.3, tx + 270, ty, 'Pós')
    ty -= 18
    for (i = 0; i < numCats; i++) {
      if (i % 2 === 0) cs += '0.96 0.96 0.98 rg\n' + tx + ' ' + (ty - 2) + ' 320 16 re f\n'
      cs += tb('F1', 9, 0.2, 0.2, 0.25, tx + 8, ty, cats[i].getString('name'))
      cs += tb('F1', 9, 0.3, 0.3, 0.85, tx + 218, ty, (s1[cats[i].id] || 0).toFixed(1))
      cs += tb('F1', 9, 0.2, 0.6, 0.3, tx + 278, ty, (s2[cats[i].id] || 0).toFixed(1))
      ty -= 16
    }
    ty -= 10
    cs += '0.85 0.85 0.9 rg\n' + tx + ' ' + (ty - 4) + ' 320 18 re f\n'
    cs += tb('F2', 10, 0.11, 0.11, 0.15, tx + 8, ty, 'Média Geral')
    cs += tb('F2', 10, 0.3, 0.3, 0.85, tx + 218, ty, (s1.overall_average || 0).toFixed(1))
    cs += tb('F2', 10, 0.2, 0.6, 0.3, tx + 278, ty, (s2.overall_average || 0).toFixed(1))
    cs += tb('F1', 7, 0.5, 0.5, 0.55, 40, 30, 'Anderson Abreu — Roda da Vida (Comparativo)')

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
