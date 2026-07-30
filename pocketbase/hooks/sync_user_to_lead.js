onRecordAfterUpdateSuccess((e) => {
  const user = e.record
  const userId = user.id
  if (!userId) return e.next()

  const fields = ['name', 'email', 'phone', 'instagram_handle']
  const changes = {}
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i]
    const newVal = user.getString(f)
    const oldVal = user.original().getString(f)
    if (newVal !== oldVal) {
      changes[f] = newVal
    }
  }

  if (Object.keys(changes).length === 0) return e.next()

  try {
    const lead = $app.findFirstRecordByFilter('crm_leads', 'linked_user = {:userId}', {
      userId: userId,
    })

    let dirty = false
    for (let j = 0; j < fields.length; j++) {
      const f = fields[j]
      if (f in changes) {
        lead.set(f, changes[f])
        dirty = true
      }
    }

    if (dirty) {
      $app.saveNoValidate(lead)
    }
  } catch (err) {
    $app.logger().error('sync_user_to_lead failed', 'error', String(err))
  }

  return e.next()
}, 'users')
