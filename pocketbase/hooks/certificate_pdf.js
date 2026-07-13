// @deps jspdf@2.5.2, qrcode-generator@1.4.4
routerAdd(
  'GET',
  '/backend/v1/certificates/{id}/pdf',
  (e) => {
    const { jsPDF } = require('jspdf')
    const qr = require('qrcode-generator')

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
      if (certUserId !== userId && !isAdmin) {
        return e.forbiddenError('Access denied')
      }
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

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    // Background - Obsidian
    doc.setFillColor(11, 15, 26)
    doc.rect(0, 0, 297, 210, 'F')

    // Radial glow - concentric circles
    doc.setFillColor(13, 20, 30)
    doc.circle(148.5, 105, 100, 'F')
    doc.setFillColor(15, 24, 34)
    doc.circle(148.5, 105, 75, 'F')
    doc.setFillColor(17, 28, 38)
    doc.circle(148.5, 105, 50, 'F')

    // Seal - metallic circular cyan
    doc.setFillColor(0, 200, 200)
    doc.circle(148.5, 30, 13, 'F')
    doc.setFillColor(11, 15, 26)
    doc.circle(148.5, 30, 11, 'F')
    doc.setTextColor(0, 200, 200)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('AA', 148.5, 33, { align: 'center' })

    // Title
    doc.setTextColor(180, 200, 210)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 53, { align: 'center' })

    // Course name - large elegant
    doc.setTextColor(0, 220, 200)
    doc.setFontSize(26)
    doc.setFont('times', 'bold')
    doc.text(courseName, 148.5, 70, { align: 'center', maxWidth: 240 })

    // Body text
    doc.setTextColor(170, 180, 190)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Certificamos que para devidos fins, o aluno', 148.5, 88, { align: 'center' })

    // Student name - serif italic
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('times', 'italic')
    doc.text(studentName, 148.5, 100, { align: 'center' })

    doc.setTextColor(170, 180, 190)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('concluiu o curso', 148.5, 112, { align: 'center' })

    doc.setTextColor(200, 210, 220)
    doc.setFontSize(14)
    doc.setFont('times', 'bold')
    doc.text(courseName, 148.5, 122, { align: 'center', maxWidth: 240 })

    doc.setTextColor(170, 180, 190)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'com carga horária de ' + workload + ' horas, assinado pelo profissional',
      148.5,
      132,
      { align: 'center', maxWidth: 240 },
    )

    doc.setTextColor(200, 210, 220)
    doc.setFontSize(13)
    doc.setFont('times', 'italic')
    doc.text(instructorName, 148.5, 142, { align: 'center' })

    doc.setTextColor(170, 180, 190)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('e passou na prova de avaliação final.', 148.5, 152, { align: 'center' })

    // Footer - Date (left)
    doc.setDrawColor(100, 120, 130)
    doc.setLineWidth(0.3)
    doc.line(40, 173, 100, 173)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 170, 180)
    doc.text(formattedDate, 70, 170, { align: 'center' })
    doc.setTextColor(120, 130, 140)
    doc.setFontSize(8)
    doc.text('Data de Conclusão', 70, 180, { align: 'center' })

    // Footer - Instructor signature (right)
    doc.line(197, 173, 257, 173)
    doc.setFont('times', 'italic')
    doc.setFontSize(14)
    doc.setTextColor(200, 210, 220)
    doc.text(instructorName, 227, 170, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(160, 170, 180)
    doc.text(instructorName, 227, 180, { align: 'center' })
    doc.setTextColor(120, 130, 140)
    doc.setFontSize(8)
    doc.text('Instrutor', 227, 185, { align: 'center' })

    // QR code - bottom right
    const qrObj = qr(0, 'M')
    qrObj.addData(verifyUrl)
    qrObj.make()
    const moduleCount = qrObj.getModuleCount()
    const cellSize = 0.8
    const qrSize = moduleCount * cellSize
    const qrX = 265
    const qrY = 185

    doc.setFillColor(255, 255, 255)
    doc.rect(qrX, qrY, qrSize, qrSize, 'F')

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrObj.isDark(row, col)) {
          doc.setFillColor(11, 15, 26)
          doc.rect(qrX + col * cellSize, qrY + row * cellSize, cellSize, cellSize, 'F')
        }
      }
    }

    doc.setTextColor(150, 160, 170)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('QR Verified', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' })

    // Preview watermark
    if (id === 'preview') {
      doc.setTextColor(255, 100, 100)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('AMOSTRA / PREVIEW', 272, 15, { align: 'right' })
    }

    const ab = doc.output('arraybuffer')
    const bytes = new Uint8Array(ab)
    return e.blob(200, 'application/pdf', bytes)
  },
  $apis.requireAuth(),
)
