migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('bio')) {
      usersCol.fields.add(new TextField({ name: 'bio' }))
    }
    app.save(usersCol)

    var coursesCol = app.findCollectionByNameOrId('courses')

    app.save(
      new Collection({
        name: 'community_posts',
        type: 'base',
        listRule: "@request.auth.id != '' && (is_hidden = false || user = @request.auth.id)",
        viewRule: "@request.auth.id != '' && (is_hidden = false || user = @request.auth.id)",
        createRule: "@request.auth.id != '' && user = @request.auth.id",
        updateRule: '@request.auth.is_admin = true || user = @request.auth.id',
        deleteRule: '@request.auth.is_admin = true || user = @request.auth.id',
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'type',
            type: 'select',
            required: true,
            values: ['text', 'image', 'video', 'achievement', 'testimony'],
            maxSelect: 1,
          },
          { name: 'content', type: 'text', required: false },
          {
            name: 'image',
            type: 'file',
            required: false,
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          { name: 'video_url', type: 'url', required: false },
          {
            name: 'related_course',
            type: 'relation',
            required: false,
            collectionId: coursesCol.id,
            maxSelect: 1,
            cascadeDelete: false,
          },
          { name: 'is_hidden', type: 'bool', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_community_posts_user ON community_posts (user)',
          'CREATE INDEX idx_community_posts_created ON community_posts (created DESC)',
        ],
      }),
    )

    var postsCol = app.findCollectionByNameOrId('community_posts')

    app.save(
      new Collection({
        name: 'community_interactions',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != '' && user = @request.auth.id",
        updateRule: "@request.auth.id != '' && user = @request.auth.id",
        deleteRule: '@request.auth.is_admin = true || user = @request.auth.id',
        fields: [
          {
            name: 'post',
            type: 'relation',
            required: true,
            collectionId: postsCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'type',
            type: 'select',
            required: true,
            values: ['like', 'comment'],
            maxSelect: 1,
          },
          { name: 'comment_text', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_community_interactions_post ON community_interactions (post)',
          'CREATE INDEX idx_community_interactions_user ON community_interactions (user)',
          "CREATE UNIQUE INDEX idx_community_likes_unique ON community_interactions (post, user) WHERE type = 'like'",
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'community_follows',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != '' && follower = @request.auth.id",
        updateRule: "@request.auth.id != '' && follower = @request.auth.id",
        deleteRule: "@request.auth.id != '' && follower = @request.auth.id",
        fields: [
          {
            name: 'follower',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'followed',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_community_follows_pair ON community_follows (follower, followed)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'notifications',
        type: 'base',
        listRule: "@request.auth.id != '' && user = @request.auth.id",
        viewRule: "@request.auth.id != '' && user = @request.auth.id",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != '' && user = @request.auth.id",
        deleteRule: '@request.auth.is_admin = true || user = @request.auth.id',
        fields: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'message', type: 'text', required: true },
          { name: 'type', type: 'text', required: false },
          { name: 'read', type: 'bool', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_notifications_user ON notifications (user)',
          'CREATE INDEX idx_notifications_read ON notifications (read)',
        ],
      }),
    )
  },
  (app) => {
    var names = ['notifications', 'community_follows', 'community_interactions', 'community_posts']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (_) {}
    }
  },
)
