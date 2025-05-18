import { findOne, patch } from '../../src/modules/questions/question-repository'
import { calculateQuestionDifficulty } from './calculate-question-difficulty'

export const addToQuestionStats = async (question, isCorrectAnswer) => {
  const originalQuestion = await findOne({ id: question.original_content_question_id })

  if (!originalQuestion) {
    return
  }

  const correctAnswerAmount = isCorrectAnswer ? originalQuestion.correct_answers_amount + 1 : originalQuestion.correct_answers_amount
  const allAnswersAmount = originalQuestion.all_answers_amount + 1

  const payload = {
    correct_answers_amount: correctAnswerAmount,
    all_answers_amount: allAnswersAmount,
    difficulty_percentage: calculateQuestionDifficulty(correctAnswerAmount, allAnswersAmount),
  }

  return patch(question.original_content_question_id, payload)
}
