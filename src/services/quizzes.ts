import pb from '@/lib/pocketbase/client'
import type { Quiz, QuizQuestion, QuizResult } from '@/types'

export const getQuizByModule = async (moduleId: string): Promise<Quiz | null> => {
  try {
    return (await pb.collection('quizzes').getFirstListItem(`module = "${moduleId}"`)) as Quiz
  } catch {
    return null
  }
}

export const getQuizQuestions = (quizId: string): Promise<QuizQuestion[]> =>
  pb
    .collection('quiz_questions')
    .getFullList({ filter: `quiz = "${quizId}"`, sort: 'created' }) as Promise<QuizQuestion[]>

export const getQuizResults = (userId: string, quizId: string): Promise<QuizResult[]> =>
  pb
    .collection('quiz_results')
    .getFullList({
      filter: `user = "${userId}" && quiz = "${quizId}"`,
      sort: '-created',
    }) as Promise<QuizResult[]>

export const saveQuizResult = (data: {
  user: string
  quiz: string
  score: number
  total: number
  passed: boolean
}): Promise<QuizResult> => pb.collection('quiz_results').create(data) as Promise<QuizResult>
