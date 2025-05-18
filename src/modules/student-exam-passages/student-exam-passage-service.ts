import { create, patch, dropPassagesWithIds } from './student-exam-passage-repository'
import { makeDTO } from './dto/student-exam-passage-dto'
import mapP from '../../../utils/function/mapp'
import { cretateExamQuestions } from '../student-exam-questions/student-exam-question-service'

const createPassage = async originalPassage => {
  const passage = await create(
    makeDTO(
      originalPassage.student_section_id,
      originalPassage.content,
      originalPassage.order,
      originalPassage.id,
      originalPassage.is_false_passage
    )
  )

  await cretateExamQuestions(passage.id, originalPassage.questions)
}

export const createStudentExamPassages = async data => (
  mapP(createPassage)(data)
)

export const changePassageContent = async (passageId, content) => (
  patch(passageId, {
    content: content,
  })
)

export const removePassagesByIds = async (passageIds: string[]) => (
  dropPassagesWithIds(passageIds)
)
