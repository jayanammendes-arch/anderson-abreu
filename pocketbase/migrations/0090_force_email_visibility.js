// Make every user's email visible to admins.
//
// Background: the `users` auth collection ships with `emailVisibility` defaulting
// to `false`. When an admin lists/views another user's record through the SDK,
// PocketBase hides the `email` field whenever the requester is not the record
// owner. The admin panel needs to read and edit the email of any student, so we
// flip the flag to `true` for all existing users and rely on the
// `force_email_visible` hook to keep it on.
migrate(
  (app) => {
    app
      .db()
      .newQuery(
        'UPDATE users SET emailVisibility = 1 WHERE emailVisibility = 0 OR emailVisibility IS NULL',
      )
      .execute()
  },
  (app) => {
    app.db().newQuery('UPDATE users SET emailVisibility = 0').execute()
  },
)
