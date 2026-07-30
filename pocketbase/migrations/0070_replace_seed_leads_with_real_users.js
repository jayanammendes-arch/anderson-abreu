migrate(
  (app) => {
    var fakeLeads = app.findRecordsByFilter('crm_leads', "email ~ 'example.com'", '', 1000, 0)
    for (var i = 0; i < fakeLeads.length; i++) {
      app.delete(fakeLeads[i])
    }

    var siteLeads = app.findRecordsByFilter('crm_leads', "source = 'site'", '', 1000, 0)
    var existingEmails = {}
    for (var k = 0; k < siteLeads.length; k++) {
      var em = siteLeads[k].getString('email').toLowerCase()
      if (em) existingEmails[em] = true
    }

    var users = app.findRecordsByFilter('users', "id != ''", 'created', 1000, 0)
    var crmCol = app.findCollectionByNameOrId('crm_leads')

    for (var j = 0; j < users.length; j++) {
      var user = users[j]
      var userEmail = user.getString('email')
      if (!userEmail) continue
      if (existingEmails[userEmail.toLowerCase()]) continue

      var record = new Record(crmCol)
      record.set('name', user.getString('name') || '')
      record.set('email', userEmail)
      record.set('phone', user.getString('phone') || '')
      record.set('instagram_handle', user.getString('instagram_handle') || '')
      record.set('source', 'site')
      record.set('linked_user', user.id)
      record.set('stage', 'Leads externos')
      app.save(record)
    }
  },
  (app) => {
    var siteLeads = app.findRecordsByFilter('crm_leads', "source = 'site'", '', 1000, 0)
    for (var i = 0; i < siteLeads.length; i++) {
      app.delete(siteLeads[i])
    }
  },
)
