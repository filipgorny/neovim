import { create, patch, dropQuestionsWithIds } from './student-exam-question-repository'
import { makeDTO } from './dto/student-exam-question-dto'
import mapP from '../../../utils/function/mapp'
import { QUESTION_STATUS_COMPLETE, QUESTION_STATUS_UNSEEN } from './question-status'
import uploadFile from '../../../services/s3/upload-file'
import { S3_PREFIX_QUESTION_BACKGROUNDS } from '../../../services/s3/s3-file-prefixes'

const createSingleQuestion = (student_passage_id: string) => async originalQuestion => (
  create(
    makeDTO(
      student_passage_id,
      originalQuestion.question_content,
      originalQuestion.answer_definition,
      originalQuestion.explanation,
      originalQuestion.chapter,
      originalQuestion.question_type,
      originalQuestion.correct_answer,
      originalQuestion.order,
      originalQuestion.id
    )
  )
)

export const cretateExamQuestions = async (studentPassageId: string, originalQuestions) => (
  mapP(
    async originalQuestion => {
      try {
        await createSingleQuestion(studentPassageId)(originalQuestion)
      } catch (e) {
        console.log(e)
      }
    }
  )(originalQuestions)
)

export const toggleQuestionFlag = async question => (
  patch(question.id, {
    is_flagged: !question.is_flagged,
  })
)

export const saveCanvas = async (question, canvas, image) => {
  const imageKey = await uploadFile(image.data, image.mimetype, S3_PREFIX_QUESTION_BACKGROUNDS)

  return patch(question.id, {
    canvas: JSON.stringify(canvas),
    background_image: imageKey,
  })
}

export const changeStatus = async (question, status) => (
  patch(question.id, {
    question_status: status,
  })
)

export const changeAnswer = async (question, answer) => (
  patch(question.id, {
    answer,
    question_status: QUESTION_STATUS_COMPLETE,
  })
)

export const changeQuestionContent = async (questionId, content) => (
  patch(questionId, {
    question_content: content,
  })
)

export const changeAnswerDefinition = async (questionId, content) => (
  patch(questionId, {
    answer_definition: content,
  })
)

export const removeQuestionsByIds = async (questionIds: string[]) => (
  dropQuestionsWithIds(questionIds)
)

export const resetQuestion = async id => (
  patch(id, {
    is_flagged: false,
    question_status: QUESTION_STATUS_UNSEEN,
    answer: null,
    canvas: null,
  })
)
