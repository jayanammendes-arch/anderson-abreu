import pb from '@/lib/pocketbase/client'
import type { UserAccess } from '@/types'

export const adminGetStudents = (search?: string) => {
  const options: any = { sort: '-created' }
  if (search && search.trim()) {
    options.filter = `name ~ "${search.trim()}" || email ~ "${search.trim()}"`
  }
  return pb.collection('users').getFullList(options)
}

export const adminGetStudentAccess = (userId: string): Promise<UserAccess[]> =>
  pb.collection('user_access').getFullList({ filter: `user = "${userId}"`, expand: 'course' })

export const adminGrantAccess = (userId: string, courseId: string) =>
  pb.collection('user_access').create({ user: userId, course: courseId })

export const adminRevokeAccess = (accessId: string) => pb.collection('user_access').delete(accessId)

export const adminUpdateLevel = (userId: string, level: string) =>
  pb.collection('users').update(userId, { level })

export const adminUpdateComecePorAquiAccess = (userId: string, enabled: boolean) =>
  pb.collection('users').update(userId, { comece_por_aqui_access: enabled })

export const adminUpdateAdminStatus = (userId: string, isAdmin: boolean) =>
  pb.collection('users').update(userId, { is_admin: isAdmin })

export const adminGetUsersByLevel = (level: string) =>
  pb.collection('users').getFullList({ filter: `level = "${level}"`, sort: '-created' })

export const adminGetHypnosisUsers = () =>
  pb.collection('users').getFullList({ filter: `is_patient = true`, sort: '-created' })

export interface AdminCreateStudentData {
  name: string
  email: string
  password: string
  passwordConfirm: string
  level?: string
  cpf?: string
  phone?: string
  instagram_handle?: string
  birth_date?: string
}

export const adminCreateStudent = async (data: AdminCreateStudentData) => {
  const payload: Record<string, unknown> = {
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    emailVisibility: true,
  }

  if (data.level) payload.level = data.level
  if (data.cpf !== undefined) payload.cpf = data.cpf.trim()
  if (data.phone !== undefined) payload.phone = data.phone.trim()
  if (data.instagram_handle !== undefined) payload.instagram_handle = data.instagram_handle.trim()
  if (data.birth_date) payload.birth_date = data.birth_date

  return pb.collection('users').create(payload)
}

export const adminDeleteStudent = async (userId: string) => {
  try {
    // Tenta primeiro o endpoint dedicado que remove todas as dependências em cascata
    const res = await pb.send(`/backend/v1/admin/students/${userId}/delete`, {
      method: 'POST',
    })
    return res
  } catch (err) {
    // Fallback: exclusão direta via SDK caso o hook esteja indisponível
    return pb.collection('users').delete(userId)
  }
}

export const adminResetComecePorAqui = async (userId: string) => {
  try {
    return await pb.send(`/backend/v1/admin/students/${userId}/reset-comece-por-aqui`, {
      method: 'POST',
    })
  } catch (err) {
    // Fallback manual no cliente caso endpoint customizado falhe
    // 1. form_submissions
    try {
      const subs = await pb
        .collection('form_submissions')
        .getFullList({ filter: `user = "${userId}"` })
      for (const s of subs) {
        await pb
          .collection('form_submissions')
          .delete(s.id)
          .catch(() => {})
      }
    } catch {
      /* intentionally ignored */
    }

    // 2. pre_hypnosis_forms
    try {
      const preForms = await pb
        .collection('pre_hypnosis_forms')
        .getFullList({ filter: `user = "${userId}"` })
      for (const pf of preForms) {
        await pb
          .collection('pre_hypnosis_forms')
          .delete(pf.id)
          .catch(() => {})
      }
    } catch {
      /* intentionally ignored */
    }

    // 3. life_wheel_assessments onde type = 'pre'
    try {
      const assessments = await pb.collection('life_wheel_assessments').getFullList({
        filter: `user = "${userId}" && type = "pre"`,
      })
      for (const a of assessments) {
        await pb
          .collection('life_wheel_assessments')
          .delete(a.id)
          .catch(() => {})
      }
    } catch {
      /* intentionally ignored */
    }

    return { success: true }
  }
}

export const adminUpdateStudent = async (
  userId: string,
  data: {
    name?: string
    email?: string
    cpf?: string
    phone?: string
    instagram_handle?: string
    birth_date?: string
  },
) => {
  const payload: Record<string, unknown> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.cpf !== undefined) payload.cpf = data.cpf
  if (data.phone !== undefined) payload.phone = data.phone
  if (data.instagram_handle !== undefined) payload.instagram_handle = data.instagram_handle
  if (data.birth_date !== undefined) payload.birth_date = data.birth_date

  if (data.email !== undefined && data.email.trim() !== '') {
    const trimmedEmail = data.email.trim()
    // Only send `email` + `emailConfirm` to the backend when the value actually
    // changed. PocketBase requires `emailConfirm` to match `email` whenever the
    // email field is present in an auth-record update, and sending an unchanged
    // email can trigger unnecessary validation. Compare against the current
    // stored value (now reliably returned thanks to emailVisibility=true).
    let currentEmail = ''
    try {
      const current = await pb.collection('users').getOne(userId)
      currentEmail = current.email || ''
    } catch {
      /* ignore — fall through to send the email */
    }
    if (currentEmail !== trimmedEmail) {
      payload.email = trimmedEmail
      payload.emailConfirm = trimmedEmail
    }
  }

  return pb.collection('users').update(userId, payload)
}
