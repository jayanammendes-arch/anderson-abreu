routerAdd(
  'GET',
  '/backend/v1/certificates/{id}/pdf',
  (e) => {
    const id = e.request.pathValue('id')
    const userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')

    let studentName, courseName, workload, instructorName, issueDate, verifyUrl

    if (id === 'preview') {
      studentName = 'Nome do Aluno Exemplo'
      courseName = 'Nome do Curso Exemplo'
      workload = 10
      instructorName = 'Nome do Instrutor Exemplo'
      issueDate = new Date().toISOString().split('T')[0]
      verifyUrl = 'https://anderson-abreu-aluno-fe857.goskip.app/verify/preview'
    } else {
      const cert = $app.findRecordById('certificates', id)
      const certUserId = cert.getString('user')
      let isAdmin = false
      try {
        isAdmin = e.auth.getBool('is_admin')
      } catch (_) {}
      if (certUserId !== userId && !isAdmin) return e.forbiddenError('Access denied')
      const user = $app.findRecordById('users', certUserId)
      const course = $app.findRecordById('courses', cert.getString('course'))
      studentName = user.getString('name') || 'Aluno'
      courseName = course.getString('title')
      workload = cert.getNum('workload_at_issue') || 0
      instructorName =
        cert.getString('instructor_at_issue') || course.getString('instructor_name') || ''
      issueDate = cert.getString('issue_date') || new Date().toISOString().split('T')[0]
      verifyUrl = 'https://anderson-abreu-aluno-fe857.goskip.app/verify/' + id
    }

    const months = [
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
    const dateObj = new Date(issueDate + 'T00:00:00')
    const formattedDate =
      dateObj.getDate() + ' de ' + months[dateObj.getMonth()] + ' de ' + dateObj.getFullYear()

    const W = 842,
      H = 595

    const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    const tw = (text, factor, size) => text.length * factor * size
    const center = (text, factor, size) => (W - tw(text, factor, size)) / 2
    const wrap = (text, maxW, factor, size) => {
      const words = text.split(' ')
      const lines = []
      let cur = ''
      for (let i = 0; i < words.length; i++) {
        const t = cur ? cur + ' ' + words[i] : words[i]
        if (tw(t, factor, size) <= maxW) cur = t
        else {
          if (cur) lines.push(cur)
          cur = words[i]
        }
      }
      if (cur) lines.push(cur)
      return lines
    }
    const textBlock = (font, size, r, g, b, x, y, text) =>
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

    let cs = ''
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

    const cLines = wrap(courseName, 600, 0.52, 26)
    let cY = 495 - (cLines.length - 1) * 30
    for (const line of cLines) {
      cs += textBlock('F4', 26, 0, 0.863, 0.784, center(line, 0.52, 26), cY, line)
      cY -= 30
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

    const cLines2 = wrap(courseName, 500, 0.52, 14)
    let cY2 = 383 - (cLines2.length - 1) * 18
    for (const line of cLines2) {
      cs += textBlock('F4', 14, 0.784, 0.824, 0.863, center(line, 0.52, 14), cY2, line)
      cY2 -= 18
    }

    const wlText = 'com carga horária de ' + workload + ' horas, assinado pelo profissional'
    const wlLines = wrap(wlText, 500, 0.5, 11)
    let wlY = cY2 - 5
    for (const line of wlLines) {
      wlY -= 16
      cs += textBlock('F1', 11, 0.667, 0.706, 0.745, center(line, 0.5, 11), wlY, line)
    }

    wlY -= 22
    cs += textBlock(
      'F5',
      13,
      0.784,
      0.824,
      0.863,
      center(instructorName, 0.45, 13),
      wlY,
      instructorName,
    )
    wlY -= 20
    cs += textBlock(
      'F1',
      11,
      0.667,
      0.706,
      0.745,
      center('e passou na prova de avaliação final.', 0.5, 11),
      wlY,
      'e passou na prova de avaliação final.',
    )

    cs += '0.392 0.471 0.510 RG\n0.3 w\n100 145 m 220 145 l S\n'
    const dateX = 160 - tw(formattedDate, 0.5, 10) / 2
    cs += textBlock('F1', 10, 0.627, 0.667, 0.706, dateX, 150, formattedDate)
    cs += textBlock('F1', 8, 0.471, 0.51, 0.549, 125, 132, 'Data de Conclusão')

    cs += '0.392 0.471 0.510 RG\n0.3 w\n560 145 m 680 145 l S\n'
    const sigX = 620 - tw(instructorName, 0.45, 14) / 2
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

    if (id === 'preview') {
      cs += textBlock('F2', 10, 1, 0.392, 0.392, 590, 565, 'AMOSTRA / PREVIEW')
    }

    const objs = [
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

    let pdf = '%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n'
    const offsets = []
    for (let i = 0; i < objs.length; i++) {
      offsets.push(pdf.length)
      pdf += i + 1 + ' 0 obj\n' + objs[i] + '\nendobj\n'
    }
    const xrefOff = pdf.length
    pdf += 'xref\n0 ' + (objs.length + 1) + '\n'
    pdf += '0000000000 65535 f \n'
    for (let j = 0; j < offsets.length; j++) {
      const off = '0000000000' + offsets[j]
      pdf += off.substring(off.length - 10) + ' 00000 n \n'
    }
    pdf +=
      'trailer\n<< /Size ' +
      (objs.length + 1) +
      ' /Root 1 0 R >>\nstartxref\n' +
      xrefOff +
      '\n%%EOF'

    const bytes = new Uint8Array(pdf.length)
    for (let k = 0; k < pdf.length; k++) {
      bytes[k] = pdf.charCodeAt(k) & 0xff
    }
    return e.blob(200, 'application/pdf', bytes)
  },
  $apis.requireAuth(),
)
