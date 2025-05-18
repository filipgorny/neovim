import { create, deleteContentQuestionsByContentId, patch, patchAll } from './student-book-content-question-repository'
import { makeDTO } from './dto/student-book-content-question'
import { BookContentQuestionType } from '../book-content-questions/book-content-question-types'
import mapP from '../../../utils/function/mapp'
import R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import { areStringArraysEqual } from '../../../utils/array/are-string-arrays-equal'
import orm from '../../models'
import { deductSaltyBucksForChapterContenQuestionReset, deductSaltyBucksForContenQuestionReset } from '../../../services/salty-bucks/salty-buck-service'
import { StudentCourse } from '../../types/student-course'

export const createBookContentQuestion = async (
  content_id: string,
  original_content_question_id: string,
  student_course_id: string
) => (
  create(
    makeDTO(content_id, original_content_question_id, student_course_id)
  )
)

export const cretateBookContentQuestionsFromOriginal = async (contentId, originals, studentCourse: StudentCourse) => (
  mapP(
    R.pipeWith(R.andThen)([
      asAsync(R.juxt([
        R.always(contentId),
        R.path(['question', 'id']),
        R.always(studentCourse.id),
      ])),
      R.apply(createBookContentQuestion),
    ])
  )(originals)
)

export const answerQuestion = async (question, answers) => (
  patch(question.id, {
    answers: JSON.stringify(answers),
    answered_at: new Date(),
    is_correct: areStringArraysEqual(answers, JSON.parse(question.originalQuestion.correct_answers)),
  })
)

export const deleteByContentId = async (content_id: string) => (
  deleteContentQuestionsByContentId(content_id)
)

export const resetQuestion = async (question, student) => (
  orm.bookshelf.transaction(async trx => {
    await patch(question.id, {
      answers: null,
      answered_at: null,
      is_correct: null,
    }, trx)

    await deductSaltyBucksForContenQuestionReset(student.id, question.id, trx)
  })
)

export const resetQuestionsByIds = async (questionIds: string[], student, chapteId: string, cost) => (
  orm.bookshelf.transaction(async trx => {
    await patchAll(questionIds, {
      answers: null,
      answered_at: null,
      is_correct: null,
    }, trx)

    await deductSaltyBucksForChapterContenQuestionReset(student.id, chapteId, cost, trx)
  })
)
