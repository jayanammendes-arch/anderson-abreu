// Keep `emailVisibility` enabled on every user record.
//
// The admin panel reads and edits the email of any student through the regular
// records API. PocketBase hides the `email` field on auth records when
// `emailVisibility` is false AND the requester is not the record owner — even
// if the requester is an admin auth record. By forcing the flag to true on every
// create/update we guarantee the email is always returned and can be edited by
// admins without the field appearing "empty" in the admin form.
onRecordCreateRequest((e) => {
  try {
    e.record.set('emailVisibility', true)
  } catch (_) {}
  return e.next()
}, 'users')

onRecordUpdateRequest((e) => {
  try {
    e.record.set('emailVisibility', true)
  } catch (_) {}
  return e.next()
}, 'users')
