onRecordAfterUpdateSuccess((e) => {
  try {
    var recordId = e.record.id
    if (!recordId) return

    var snapshotJson = JSON.stringify(e.record)

    var existing = $app.findRecordsByFilter(
      'content_snapshots',
      "record_id = '" + recordId + "'",
      '-created',
      1,
      0,
    )
    if (existing.length > 0 && existing[0].getString('snapshot') === snapshotJson) return

    var snapCol = $app.findCollectionByNameOrId('content_snapshots')
    var snap = new Record(snapCol)
    snap.set('record_id', recordId)
    snap.set('snapshot', snapshotJson)
    if (e.auth && e.auth.id) {
      snap.set('user', e.auth.id)
    }
    $app.saveNoValidate(snap)
  } catch (err) {
    $app.logger().error('failed to create snapshot on update', 'error', String(err))
  }
}, 'treatment_categories')
