// Prevent a non-admin user from elevating their own level or releasing the
// "Comece por Aqui" module to themselves through the regular record update API.
//
// Admins are allowed to change any field. Self-service profile updates (name,
// avatar, phone, etc.) remain allowed — we only strip the protected fields.
onRecordUpdateRequest((e) => {
  var isAdmin = e.auth && e.auth.getBool && e.auth.getBool('is_admin')
  var isSelf = e.auth && e.auth.id && e.auth.id === e.record.id

  // Admins (or internal saves with no request auth) are unrestricted.
  if (isAdmin || !e.auth) {
    return e.next()
  }

  // A non-admin user is editing a record. Only their own record is reachable
  // through the API rule, but guard defensively in case rules change.
  if (isSelf) {
    // Restore protected fields to their original values so a self-update
    // cannot change the user's level or the "Comece por Aqui" release flag.
    var rec = e.record
    var orig = rec.original()

    try {
      rec.set('level', orig.getString('level'))
    } catch (_) {}
    try {
      rec.set('comece_por_aqui_access', orig.getBool('comece_por_aqui_access'))
    } catch (_) {}
    try {
      rec.set('is_admin', orig.getBool('is_admin'))
    } catch (_) {}
  }

  return e.next()
}, 'users')
