import pb from '@/lib/pocketbase/client'
import type { FormConfig, FormQuestion, FormSubmission } from '@/types'

export const getForms = (): Promise<FormConfig[]> =>
  pb.collection('forms').getFullList({ sort: 'created' })

export const getForm = (id: string): Promise<FormConfig> => pb.collection('forms').getOne(id)

export const createForm = (data: { title: string; description?: string; is_active?: boolean }) =>
  pb.collection('forms').create(data)

export const updateForm = (
  id: string,
  data: Partial<{ title: string; description: string; is_active: boolean }>,
) => pb.collection('forms').update(id, data)

export const deleteForm = (id: string) => pb.collection('forms').delete(id)

export const getFormQuestions = (formId: string): Promise<FormQuestion[]> =>
  pb.collection('form_questions').getFullList({ filter: `form = "${formId}"`, sort: 'order' })

export const createFormQuestion = (data: {
  form: string
  question_text: string
  question_type: string
  options?: string[]
  order: number
  required?: boolean
}) => pb.collection('form_questions').create(data)

export const updateFormQuestion = (
  id: string,
  data: Partial<{
    question_text: string
    question_type: string
    options?: string[]
    order: number
    required: boolean
  }>,
) => pb.collection('form_questions').update(id, data)

export const deleteFormQuestion = (id: string) => pb.collection('form_questions').delete(id)

export async function getFormSubmission(
  userId: string,
  formId: string,
): Promise<FormSubmission | null> {
  try {
    return (await pb
      .collection('form_submissions')
      .getFirstListItem(`user = "${userId}" && form = "${formId}"`)) as FormSubmission
  } catch {
    return null
  }
}

export const createFormSubmission = (data: { user: string; form: string; answers: unknown[] }) =>
  pb.collection('form_submissions').create(data)

export async function getFormSubmissionsByUser(userId: string): Promise<FormSubmission[]> {
  return (await pb
    .collection('form_submissions')
    .getFullList({ filter: `user = "${userId}"`, sort: '-created' })) as FormSubmission[]
}
