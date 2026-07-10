migrate(
  (app) => {
    const coursesCol = app.findCollectionByNameOrId('courses')

    app.save(
      new Collection({
        name: 'testimonials',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          { name: 'student_name', type: 'text', required: true },
          {
            name: 'type',
            type: 'select',
            required: true,
            values: ['text', 'video'],
            maxSelect: 1,
          },
          { name: 'content', type: 'text', required: false },
          {
            name: 'student_image',
            type: 'file',
            required: false,
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          {
            name: 'course',
            type: 'relation',
            required: false,
            collectionId: coursesCol.id,
            maxSelect: 1,
            cascadeDelete: false,
          },
          { name: 'is_active', type: 'bool', required: false },
          { name: 'order', type: 'number', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_testimonials_is_active ON testimonials (is_active)',
          'CREATE INDEX idx_testimonials_student_name ON testimonials (student_name)',
          'CREATE INDEX idx_testimonials_order ON testimonials (order)',
        ],
      }),
    )
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('testimonials'))
    } catch (_) {}
  },
)
