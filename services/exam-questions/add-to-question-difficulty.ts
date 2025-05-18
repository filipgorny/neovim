import R from 'ramda'
import { findOneOrFail, patch } from '../../src/modules/exam-questions/exam-question-repository'
import { calculateQuestionDifficulty } from '../questions/calculate-question-difficulty'
import { updateAnswerDistribution } from './update-answer-distribution'
import { getAnswerDistribution } from './get-answer-distribution'

export default async question => {
  if (!question.answer) {
    question.answer = 'no-answer-given'
  }

  const isCorrectAnswer = question.answer === question.correct_answer
  const originalQuestion = await findOneOrFail({ id: question.original_exam_question_id })

  const correctAnswerAmount = isCorrectAnswer ? originalQuestion.correct_answers_amount + 1 : originalQuestion.correct_answers_amount
  const allAnswersAmount = originalQuestion.all_answers_amount + 1

  const payload = {
    correct_answers_amount: correctAnswerAmount,
    all_answers_amount: allAnswersAmount,
    difficulty_percentage: calculateQuestionDifficulty(correctAnswerAmount, allAnswersAmount),
    answer_distribution: R.pipe(
      getAnswerDistribution,
      updateAnswerDistribution(question.answer, allAnswersAmount)
    )(originalQuestion),
  }

  return patch(question.original_exam_question_id, payload)
}
