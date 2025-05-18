import * as R from 'ramda'
import { areStringArraysEqual } from '../../../../utils/array/are-string-arrays-equal'
import { contentQuestionDoesNotBelongToStudentException, throwException } from '../../../../utils/error/error-factory'
import { findOneOrFail } from '../student-book-content-question-repository'
import { answerQuestion } from '../student-book-content-question-service'
import { addToQuestionStats } from '../../../../services/questions/add-to-question-stats'
import { earnSaltyBucksForContentQuestionAttempt, earnSaltyBucksForCorrectContentQuestionAnswer } from '../../../../services/salty-bucks/salty-buck-service'
import { StudentCourse } from '../../../types/student-course'

type Payload = {
  answers: string[]
}

const validateQuestionBelongsToUser = (question, studentId) => (
  R.pipe(
    R.path(['content', 'subchapter', 'chapter', 'book', 'student_id']),
    R.unless(
      R.equals(studentId),
      () => throwException(contentQuestionDoesNotBelongToStudentException())
    )
  )(question)
)

const getBookIdFromQuestion = (question): string => (
  R.path(['content', 'subchapter', 'chapter', 'book', 'id'])(question)
)

const getDifficultyFromQuestion = (question): string => (
  R.path(['originalQuestion', 'difficulty_percentage'])(question)
)

const setOriginalQuestionData = (targetQuestion, baseQuestion) => {
  targetQuestion.set('question', baseQuestion.originalQuestion.question_content_delta_object)
  targetQuestion.set('correct_answers', baseQuestion.originalQuestion.correct_answers)
  targetQuestion.set('explanation', baseQuestion.originalQuestion.explanation_delta_object)
  targetQuestion.set('answer_definition', baseQuestion.originalQuestion.answer_definition)
  targetQuestion.set('type', baseQuestion.originalQuestion.type)
}

export default async (id, student, payload: Payload, studentCourse: StudentCourse) => {
  const question = await findOneOrFail({ id }, ['content.subchapter.chapter.book', 'originalQuestion'])

  validateQuestionBelongsToUser(question, student.id)

  if (question.answered_at) {
    return question
  }

  const isAnsweredCorrectly = areStringArraysEqual(payload.answers, JSON.parse(question.originalQuestion.correct_answers))
  const bookId = getBookIdFromQuestion(question)

  if (isAnsweredCorrectly) {
    await earnSaltyBucksForCorrectContentQuestionAnswer(student.id, getDifficultyFromQuestion(question), bookId, studentCourse)
  } else {
    await earnSaltyBucksForContentQuestionAttempt(student.id, bookId, studentCourse)
  }

  await addToQuestionStats(question, isAnsweredCorrectly)

  const updatedQuestion = await answerQuestion(question, payload.answers)

  setOriginalQuestionData(updatedQuestion, question)

  return updatedQuestion
}
