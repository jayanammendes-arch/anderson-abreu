migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('blog_posts')
    if (!col.fields.getByName('order')) {
      col.fields.add(new NumberField({ name: 'order' }))
    }
    col.addIndex('idx_blog_posts_order', false, 'order', '')
    app.save(col)

    try {
      const posts = app.findRecordsByFilter('blog_posts', '', 'created', 1000, 0)
      posts.forEach((record, index) => {
        record.set('order', index + 1)
        app.save(record)
      })
    } catch (_) {}
  },
  (app) => {
    const col = app.findCollectionByNameOrId('blog_posts')
    try {
      col.removeIndex('idx_blog_posts_order')
    } catch (_) {}
    app.save(col)
  },
)
