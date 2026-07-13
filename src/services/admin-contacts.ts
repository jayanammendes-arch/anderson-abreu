import pb from '@/lib/pocketbase/client'

export interface AdminContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  message: string
  created: string
}

export const adminGetContacts = () =>
  pb.collection('contact_submissions').getFullList<AdminContactSubmission>({
    sort: '-created',
  })

export const adminDeleteContact = (id: string) => pb.collection('contact_submissions').delete(id)
