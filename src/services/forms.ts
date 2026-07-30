import pb from '@/lib/pocketbase/client'
import type { FormConfig, FormQuestion, FormSubmission, FormAnswers } from '@/types'

export const getForms = (): Promise<FormConfig[]> =>
  pb.collection('forms').getFullList({ sort: 'created' })

export const getForm = (id: string): Promise<FormConfig> => pb.collection('forms').getOne(id)

export const createForm = (data: Record<string, unknown>) => pb.collection('forms').create(data)

export const updateForm = (id: string, data: Record<string, unknown>) =>
  pb.collection('forms').update(id, data)

export const deleteForm = (id: string) => pb.collection('forms').delete(id)

export const getFormQuestions = (formId: string): Promise<FormQuestion[]> =>
  pb.collection('form_questions').getFullList({ filter: `form = "${formId}"`, sort: 'order' })

export const createFormQuestion = (data: Partial<FormQuestion>) =>
  pb.collection('form_questions').create(data)

export const updateFormQuestion = (id: string, data: Partial<FormQuestion>) =>
  pb.collection('form_questions').update(id, data)

export const deleteFormQuestion = (id: string) => pb.collection('form_questions').delete(id)

export async function getFormSubmission(
  userId: string,
  formId: string,
): Promise<FormSubmission | null> {
  try {
    return await pb
      .collection('form_submissions')
      .getFirstListItem(`user = "${userId}" && form = "${formId}"`)
  } catch {
    return null
  }
}

export const createFormSubmission = (data: { user: string; form: string; answers: FormAnswers }) =>
  pb.collection('form_submissions').create(data)

export async function getFormSubmissionsByFormId(formId: string): Promise<FormSubmission[]> {
  return await pb
    .collection('form_submissions')
    .getFullList({ filter: `form = "${formId}"`, sort: '-created', expand: 'user' })
}

export async function getFormSubmissionsByUser(userId: string): Promise<FormSubmission[]> {
  return await pb
    .collection('form_submissions')
    .getFullList({ filter: `user = "${userId}"`, sort: '-created' })
}

export function getFormHeaderImageUrl(form: FormConfig): string | null {
  if (!form.header_image) return null
  return pb.files.getURL(form as any, form.header_image)
}
