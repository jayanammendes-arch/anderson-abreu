migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (!col.fields.getByName('crop_x')) {
      col.fields.add(new NumberField({ name: 'crop_x' }))
    }
    if (!col.fields.getByName('crop_y')) {
      col.fields.add(new NumberField({ name: 'crop_y' }))
    }

    if (col.fields.getByName('image_position')) {
      col.fields.removeByName('image_position')
    }

    app.save(col)

    var records = app.findRecordsByFilter('treatment_categories', 'id != ""', '', 0, 0)
    for (var i = 0; i < records.length; i++) {
      var rec = records[i]
      var changed = false
      if (!rec.get('crop_x') && rec.get('crop_x') !== 0) {
        rec.set('crop_x', 0.5)
        changed = true
      }
      if (!rec.get('crop_y') && rec.get('crop_y') !== 0) {
        rec.set('crop_y', 0.5)
        changed = true
      }
      if (changed) {
        app.save(rec)
      }
    }
  },
  (app) => {
    var col = app.findCollectionByNameOrId('treatment_categories')

    if (col.fields.getByName('crop_x')) {
      col.fields.removeByName('crop_x')
    }
    if (col.fields.getByName('crop_y')) {
      col.fields.removeByName('crop_y')
    }

    if (!col.fields.getByName('image_position')) {
      col.fields.add(
        new SelectField({
          name: 'image_position',
          values: ['top', 'center', 'bottom', 'left', 'right', 'center-left', 'center-right'],
          maxSelect: 1,
        }),
      )
    }

    app.save(col)
  },
)
