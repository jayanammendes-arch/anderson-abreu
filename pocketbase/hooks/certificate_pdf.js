routerAdd(
  'GET',
  '/backend/v1/certificates/{id}/pdf',
  (e) => {
    const id = e.request.pathValue('id')
    const userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')

    const cert = $app.findRecordById('certificates', id)
    const certUserId = cert.getString('user')
    let isAdmin = false
    try {
      isAdmin = e.auth.getBool('is_admin')
    } catch (_) {}
    if (certUserId !== userId && !isAdmin && !e.hasSuperuserAuth())
      return e.forbiddenError('Access denied')

    const user = $app.findRecordById('users', certUserId)
    const course = $app.findRecordById('courses', cert.getString('course'))

    const studentName = user.getString('name') || 'Aluno'
    const courseName = course.getString('title')
    const workload = cert.getNum('workload_at_issue') || 0
    const instructorName =
      cert.getString('instructor_at_issue') || course.getString('instructor_name') || ''
    const issueDate = cert.getString('issue_date') || new Date().toISOString().split('T')[0]
    const verifyUrl = 'https://anderson-abreu-aluno-fe857.goskip.app/verify/' + id

    let hasActiveQuiz = false
    try {
      var courseMods = $app.findRecordsByFilter(
        'modules',
        'course = "' + cert.getString('course') + '"',
        '',
        0,
        0,
      )
      for (var mi = 0; mi < courseMods.length; mi++) {
        try {
          var courseQuizzes = $app.findRecordsByFilter(
            'quizzes',
            'module = "' + courseMods[mi].id + '"',
            '',
            0,
            0,
          )
          for (var qi = 0; qi < courseQuizzes.length; qi++) {
            if (courseQuizzes[qi].getBool('is_active')) {
              hasActiveQuiz = true
              break
            }
          }
        } catch (_) {}
        if (hasActiveQuiz) break
      }
    } catch (_) {}

    var months = [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro',
    ]
    var dateObj = new Date(issueDate + 'T00:00:00')
    var monthName = months[dateObj.getMonth()]
    var monthYear =
      monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' de ' + dateObj.getFullYear()

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
    var wrap = function (text, maxW, factor, size) {
      var words = text.split(' ')
      var lines = []
      var cur = ''
      for (var i = 0; i < words.length; i++) {
        var t = cur ? cur + ' ' + words[i] : words[i]
        if (tw(t, factor, size) <= maxW) cur = t
        else {
          if (cur) lines.push(cur)
          cur = words[i]
        }
      }
      if (cur) lines.push(cur)
      return lines
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

    var templateFile = course.getString('certificate_template')
    var useTemplate = false
    var imgData = null
    var imgW = 0,
      imgH = 0
    var imgType = ''
    var pngColors = 3

    if (templateFile) {
      var baseUrl = $secrets.get('PB_INSTANCE_URL') || ''
      var fileUrl = baseUrl + '/api/files/courses/' + course.id + '/' + templateFile
      try {
        var imgRes = $http.send({ url: fileUrl, method: 'GET', timeout: 30 })
        if (imgRes.statusCode === 200 && imgRes.body) {
          var bodyLen = imgRes.body.length
          if (bodyLen > 4) {
            var b0 = imgRes.body.charCodeAt(0) & 0xff
            var b1 = imgRes.body.charCodeAt(1) & 0xff
            if (b0 === 0xff && b1 === 0xd8) {
              var ii = 2
              while (ii < bodyLen - 9) {
                if ((imgRes.body.charCodeAt(ii) & 0xff) !== 0xff) {
                  ii++
                  continue
                }
                var marker = imgRes.body.charCodeAt(ii + 1) & 0xff
                ii += 2
                if (
                  marker >= 0xc0 &&
                  marker <= 0xcf &&
                  marker !== 0xc4 &&
                  marker !== 0xc8 &&
                  marker !== 0xcc
                ) {
                  imgH =
                    ((imgRes.body.charCodeAt(ii + 3) & 0xff) << 8) |
                    (imgRes.body.charCodeAt(ii + 4) & 0xff)
                  imgW =
                    ((imgRes.body.charCodeAt(ii + 5) & 0xff) << 8) |
                    (imgRes.body.charCodeAt(ii + 6) & 0xff)
                  break
                }
                var segLen =
                  ((imgRes.body.charCodeAt(ii) & 0xff) << 8) |
                  (imgRes.body.charCodeAt(ii + 1) & 0xff)
                ii += segLen
              }
              if (imgW > 0 && imgH > 0) {
                useTemplate = true
                imgData = imgRes.body
                imgType = 'jpeg'
              }
            } else if (b0 === 0x89 && b1 === 0x50 && bodyLen > 24) {
              var pngD = 8
              var pngIhdrLen =
                ((imgRes.body.charCodeAt(pngD) & 0xff) << 24) |
                ((imgRes.body.charCodeAt(pngD + 1) & 0xff) << 16) |
                ((imgRes.body.charCodeAt(pngD + 2) & 0xff) << 8) |
                (imgRes.body.charCodeAt(pngD + 3) & 0xff)
              var pngIhdrType = String.fromCharCode(
                imgRes.body.charCodeAt(pngD + 4),
                imgRes.body.charCodeAt(pngD + 5),
                imgRes.body.charCodeAt(pngD + 6),
                imgRes.body.charCodeAt(pngD + 7),
              )
              if (pngIhdrType === 'IHDR' && pngIhdrLen >= 13) {
                var pngD2 = pngD + 8
                imgW =
                  ((imgRes.body.charCodeAt(pngD2) & 0xff) << 24) |
                  ((imgRes.body.charCodeAt(pngD2 + 1) & 0xff) << 16) |
                  ((imgRes.body.charCodeAt(pngD2 + 2) & 0xff) << 8) |
                  (imgRes.body.charCodeAt(pngD2 + 3) & 0xff)
                imgH =
                  ((imgRes.body.charCodeAt(pngD2 + 4) & 0xff) << 24) |
                  ((imgRes.body.charCodeAt(pngD2 + 5) & 0xff) << 16) |
                  ((imgRes.body.charCodeAt(pngD2 + 6) & 0xff) << 8) |
                  (imgRes.body.charCodeAt(pngD2 + 7) & 0xff)
                var pngBitDepth = imgRes.body.charCodeAt(pngD2 + 8) & 0xff
                var pngColorType = imgRes.body.charCodeAt(pngD2 + 9) & 0xff
                if (pngBitDepth === 8 && (pngColorType === 2 || pngColorType === 0)) {
                  var pngNumColors = pngColorType === 2 ? 3 : 1
                  var pngIdat = ''
                  var pngOff = pngD + 12 + pngIhdrLen + 4
                  while (pngOff < bodyLen - 8) {
                    var cLen =
                      ((imgRes.body.charCodeAt(pngOff) & 0xff) << 24) |
                      ((imgRes.body.charCodeAt(pngOff + 1) & 0xff) << 16) |
                      ((imgRes.body.charCodeAt(pngOff + 2) & 0xff) << 8) |
                      (imgRes.body.charCodeAt(pngOff + 3) & 0xff)
                    var cType = String.fromCharCode(
                      imgRes.body.charCodeAt(pngOff + 4),
                      imgRes.body.charCodeAt(pngOff + 5),
                      imgRes.body.charCodeAt(pngOff + 6),
                      imgRes.body.charCodeAt(pngOff + 7),
                    )
                    if (cType === 'IDAT') {
                      pngIdat += imgRes.body.substring(pngOff + 8, pngOff + 8 + cLen)
                    }
                    pngOff += 12 + cLen
                    if (cType === 'IEND') break
                  }
                  if (imgW > 0 && imgH > 0 && pngIdat.length > 0) {
                    useTemplate = true
                    imgData = pngIdat
                    imgType = 'png'
                    pngColors = pngNumColors
                  }
                }
              }
            }
          }
        }
      } catch (_) {}
    }

    var cs = ''
    var objs = []

    if (useTemplate) {
      cs += 'q\n' + W + ' 0 0 ' + H + ' 0 0 cm\n/Im1 Do\nQ\n'

      cs += textBlock(
        'F1',
        12,
        0.4,
        0.4,
        0.45,
        center('CERTIFICADO DE CONCLUSÃO', 0.5, 12),
        470,
        'CERTIFICADO DE CONCLUSÃO',
      )

      cs += textBlock(
        'F1',
        11,
        0.4,
        0.4,
        0.45,
        center('Certificamos que para devidos fins, o aluno', 0.5, 11),
        430,
        'Certificamos que para devidos fins, o aluno',
      )
      cs += textBlock('F5', 20, 0.05, 0.05, 0.1, center(studentName, 0.45, 20), 400, studentName)
      cs += textBlock(
        'F1',
        11,
        0.4,
        0.4,
        0.45,
        center('concluiu o curso', 0.5, 11),
        375,
        'concluiu o curso',
      )

      var cLines = wrap(courseName, 600, 0.52, 16)
      var cY = 350 - (cLines.length - 1) * 20
      for (var ci = 0; ci < cLines.length; ci++) {
        cs += textBlock('F4', 16, 0.1, 0.1, 0.15, center(cLines[ci], 0.52, 16), cY, cLines[ci])
        cY -= 20
      }

      var wlText = 'com carga horária de ' + workload + ' horas'
      var wlLines = wrap(wlText, 500, 0.5, 11)
      var wlY = cY + 10
      for (var wli = 0; wli < wlLines.length; wli++) {
        wlY -= 16
        cs += textBlock('F1', 11, 0.3, 0.3, 0.35, center(wlLines[wli], 0.5, 11), wlY, wlLines[wli])
      }

      wlY -= 28
      cs += textBlock(
        'F5',
        14,
        0.1,
        0.1,
        0.15,
        center(instructorName, 0.45, 14),
        wlY,
        instructorName,
      )

      var dateLineY = wlY - 35
      cs += textBlock('F1', 12, 0.3, 0.3, 0.35, center(monthYear, 0.5, 12), dateLineY, monthYear)

      cs += textBlock('F1', 8, 0.4, 0.4, 0.45, center(verifyUrl, 0.5, 8), 55, verifyUrl)
      cs += textBlock(
        'F1',
        7,
        0.5,
        0.5,
        0.55,
        center('Verifique a autenticidade deste certificado', 0.5, 7),
        45,
        'Verifique a autenticidade deste certificado',
      )

      var imgObj =
        imgType === 'png'
          ? '<< /Type /XObject /Subtype /Image /Width ' +
            imgW +
            ' /Height ' +
            imgH +
            ' /ColorSpace ' +
            (pngColors === 1 ? '/DeviceGray' : '/DeviceRGB') +
            ' /BitsPerComponent 8 /Filter /FlateDecode /DecodeParms << /Predictor 15 /Colors ' +
            pngColors +
            ' /BitsPerComponent 8 /Columns ' +
            imgW +
            ' >> /Length ' +
            imgData.length +
            ' >>\nstream\n' +
            imgData +
            '\nendstream'
          : '<< /Type /XObject /Subtype /Image /Width ' +
            imgW +
            ' /Height ' +
            imgH +
            ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' +
            imgData.length +
            ' >>\nstream\n' +
            imgData +
            '\nendstream'

      objs = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
          W +
          ' ' +
          H +
          '] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R /F4 8 0 R /F5 9 0 R >> /XObject << /Im1 10 0 R >> >> >>',
        '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>',
        imgObj,
      ]
    } else {
      cs += '0.043 0.059 0.102 rg\n0 0 ' + W + ' ' + H + ' re f\n'
      cs += '0.051 0.078 0.118 rg\n42 47 758 500 re f\n'
      cs += '0.059 0.094 0.133 rg\n92 97 658 400 re f\n'
      cs += '0.067 0.110 0.149 rg\n142 147 558 300 re f\n'

      cs += '0 0.784 0.784 rg\n405 530 32 32 re f\n'
      cs += '0.043 0.059 0.102 rg\n409 534 24 24 re f\n'
      cs += textBlock('F2', 14, 0, 0.784, 0.784, 416, 541, 'AA')

      cs += textBlock(
        'F1',
        12,
        0.706,
        0.784,
        0.824,
        center('CERTIFICADO DE CONCLUSÃO', 0.5, 12),
        510,
        'CERTIFICADO DE CONCLUSÃO',
      )

      var cLinesGen = wrap(courseName, 600, 0.52, 26)
      var cYGen = 495 - (cLinesGen.length - 1) * 30
      for (var cgi = 0; cgi < cLinesGen.length; cgi++) {
        cs += textBlock(
          'F4',
          26,
          0,
          0.863,
          0.784,
          center(cLinesGen[cgi], 0.52, 26),
          cYGen,
          cLinesGen[cgi],
        )
        cYGen -= 30
      }

      cs += textBlock(
        'F1',
        11,
        0.667,
        0.706,
        0.745,
        center('Certificamos que para devidos fins, o aluno', 0.5, 11),
        440,
        'Certificamos que para devidos fins, o aluno',
      )
      cs += textBlock('F5', 18, 1, 1, 1, center(studentName, 0.45, 18), 415, studentName)
      cs += textBlock(
        'F1',
        11,
        0.667,
        0.706,
        0.745,
        center('concluiu o curso', 0.5, 11),
        398,
        'concluiu o curso',
      )

      var cLines2 = wrap(courseName, 500, 0.52, 14)
      var cY2 = 383 - (cLines2.length - 1) * 18
      for (var ci2 = 0; ci2 < cLines2.length; ci2++) {
        cs += textBlock(
          'F4',
          14,
          0.784,
          0.824,
          0.863,
          center(cLines2[ci2], 0.52, 14),
          cY2,
          cLines2[ci2],
        )
        cY2 -= 18
      }

      var wlTextGen = 'com carga horária de ' + workload + ' horas, assinado pelo profissional'
      var wlLinesGen = wrap(wlTextGen, 500, 0.5, 11)
      var wlYGen = cY2 - 5
      for (var wlgi = 0; wlgi < wlLinesGen.length; wlgi++) {
        wlYGen -= 16
        cs += textBlock(
          'F1',
          11,
          0.667,
          0.706,
          0.745,
          center(wlLinesGen[wlgi], 0.5, 11),
          wlYGen,
          wlLinesGen[wlgi],
        )
      }

      wlYGen -= 22
      cs += textBlock(
        'F5',
        13,
        0.784,
        0.824,
        0.863,
        center(instructorName, 0.45, 13),
        wlYGen,
        instructorName,
      )
      if (hasActiveQuiz) {
        wlYGen -= 20
        cs += textBlock(
          'F1',
          11,
          0.667,
          0.706,
          0.745,
          center('e passou na prova de avaliação final.', 0.5, 11),
          wlYGen,
          'e passou na prova de avaliação final.',
        )
      }

      cs += '0.392 0.471 0.510 RG\n0.3 w\n100 145 m 220 145 l S\n'
      var dateX = 160 - tw(monthYear, 0.5, 10) / 2
      cs += textBlock('F1', 10, 0.627, 0.667, 0.706, dateX, 150, monthYear)
      cs += textBlock('F1', 8, 0.471, 0.51, 0.549, 125, 132, 'Data de Conclusão')

      cs += '0.392 0.471 0.510 RG\n0.3 w\n560 145 m 680 145 l S\n'
      var sigX = 620 - tw(instructorName, 0.45, 14) / 2
      cs += textBlock('F5', 14, 0.784, 0.824, 0.863, sigX, 150, instructorName)
      cs += textBlock('F1', 8, 0.471, 0.51, 0.549, 600, 132, 'Instrutor')

      cs += textBlock('F1', 8, 0.588, 0.627, 0.667, center(verifyUrl, 0.5, 8), 80, verifyUrl)
      cs += textBlock(
        'F1',
        7,
        0.471,
        0.51,
        0.549,
        center('Verifique a autenticidade deste certificado', 0.5, 7),
        70,
        'Verifique a autenticidade deste certificado',
      )

      objs = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
          W +
          ' ' +
          H +
          '] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R /F4 8 0 R /F5 9 0 R >> >> >>',
        '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>',
      ]
    }

    var pdf = '%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n'
    var offsets = []
    for (var i = 0; i < objs.length; i++) {
      offsets.push(pdf.length)
      pdf += i + 1 + ' 0 obj\n' + objs[i] + '\nendobj\n'
    }
    var xrefOff = pdf.length
    pdf += 'xref\n0 ' + (objs.length + 1) + '\n'
    pdf += '0000000000 65535 f \n'
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
