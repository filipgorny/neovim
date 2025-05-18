import * as R from 'ramda'
import { areStringArraysEqual } from '../../../../utils/array/are-string-arrays-equal'
import { findOne as findStudentQuestion } from '../student-book-content-question-repository'
import { findOne as findBookContentQuestion } from '../../book-content-questions/book-content-questions-repository'
import { answerQuestion, cretateBookContentQuestionsFromOriginal } from '../student-book-content-question-service'
import { addToQuestionStats } from '../../../../services/questions/add-to-question-stats'
import { earnSaltyBucksForContentQuestionAttempt, earnSaltyBucksForCorrectContentQuestionAnswer } from '../../../../services/salty-bucks/salty-buck-service'
import { StudentCourse } from '../../../types/student-course'

type Payload = {
  answers: string[]
  student_book_content_id: string
}

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

export default async (book_content_question_id: string, studentCourse: StudentCourse, payload: Payload, student) => {
  const bookContentQuestion = await findBookContentQuestion({ id: book_content_question_id }, ['question'])

  let question = await findStudentQuestion({ original_content_question_id: bookContentQuestion.question_id, student_course_id: studentCourse.id }, ['content.subchapter.chapter.book', 'originalQuestion'])

  if (!question) {
    await cretateBookContentQuestionsFromOriginal(payload.student_book_content_id, [bookContentQuestion], studentCourse)

    question = await findStudentQuestion({ original_content_question_id: bookContentQuestion.question_id, student_course_id: studentCourse.id }, ['content.subchapter.chapter.book', 'originalQuestion'])
  }

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
