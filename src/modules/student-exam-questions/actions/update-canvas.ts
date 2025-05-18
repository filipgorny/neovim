import R from 'ramda'
import { validateQuestionBelongsToStudent } from '../validation/validate-question-belongs-to-student'
import { findOneOrFail } from '../student-exam-question-repository'
import { saveCanvas } from '../student-exam-question-service'
import { validateExamIsCompleted } from '../../student-exams/validation/validate-exam-is-complete'
import { fileSchema } from '../validation/schema/update-canvas-schema'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { customException, throwException } from '../../../../utils/error/error-factory'

const throwCanvasFormatException = () => throwException(customException('entity.invalid', 422, 'Not a json type on canvas property'))

const extractExam = R.pathOr({}, ['passage', 'section', 'exam'])

const validateCanvasJSON = json => {
  try {
    return JSON.parse(json)
  } catch (e) {
    throwCanvasFormatException()
  }
}

export default async (id, student, files, payload) => {
  validateFilesPayload(fileSchema)(files)

  const question = await findOneOrFail({ id }, ['passage.section.exam'])

  validateQuestionBelongsToStudent(student.id)(question)
  validateExamIsCompleted(extractExam(question))
  validateCanvasJSON(payload.canvas)

  return saveCanvas(question, JSON.parse(payload.canvas), files.image)
}
