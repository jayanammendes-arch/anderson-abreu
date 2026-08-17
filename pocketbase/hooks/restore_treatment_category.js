routerAdd(
  'POST',
  '/backend/v1/treatment-categories/{id}/restore/{snapshotId}',
  (e) => {
    if (!e.auth || !e.auth.getBool('is_admin')) {
      return e.forbiddenError('admin access required')
    }

    var categoryId = e.request.pathValue('id')
    var snapshotId = e.request.pathValue('snapshotId')

    var snapshot
    try {
      snapshot = $app.findRecordById('content_snapshots', snapshotId)
    } catch (err) {
      return e.notFoundError('snapshot not found')
    }

    var snapshotData = JSON.parse(snapshot.getString('snapshot'))

    var category
    try {
      category = $app.findRecordById('treatment_categories', categoryId)
    } catch (err) {
      return e.notFoundError('category not found')
    }

    var fieldNames = [
      'name',
      'slug',
      'short_description',
      'detailed_content',
      'image',
      'icon',
      'symptoms_list',
      'order',
      'como_funciona_text',
      'como_funciona_images',
      'resultados_text',
      'resultados_images',
      'cta_text',
      'cta_images',
      'is_active',
      'como_funciona_title',
      'resultados_title',
      'sintomas_title',
      'cta_title',
      'sections_config',
      'faixa_text',
      'sintomas_text',
      'sintomas_image',
      'hide_icon',
      'crop_x',
      'crop_y',
      'como_funciona_image',
      'faixa_azul_frase',
      'resultados_image',
      'por_que_tantas_title',
      'por_que_tantas_content',
      'comparacao_title',
      'comparacao_content',
      'heading_sizes',
      'font_sizes',
    ]

    for (var i = 0; i < fieldNames.length; i++) {
      var fName = fieldNames[i]
      if (snapshotData[fName] !== undefined && snapshotData[fName] !== null) {
        category.set(fName, snapshotData[fName])
      }
    }

    $app.saveNoValidate(category)

    try {
      var updatedRecord = $app.findRecordById('treatment_categories', categoryId)
      var newSnapshotJson = JSON.stringify(updatedRecord)
      var snapCol = $app.findCollectionByNameOrId('content_snapshots')
      var newSnap = new Record(snapCol)
      newSnap.set('record_id', categoryId)
      newSnap.set('snapshot', newSnapshotJson)
      newSnap.set('user', e.auth.id)
      $app.saveNoValidate(newSnap)
    } catch (err) {
      $app.logger().error('failed to create restore snapshot', 'error', String(err))
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
