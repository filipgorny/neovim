import R from 'ramda'
import { countCorrectlyAnsweredQuestions, create, findOneOrFail, patch } from './student-exam-section-repository'
import { makeDTO } from './dto/student-exam-section-dto'
import mapP from '../../../utils/function/mapp'
import asAsync from '../../../utils/function/as-async'
import { createStudentExamPassages } from '../student-exam-passages/student-exam-passage-service'
import concatPath from '../../../utils/function/concatpath'
import { SECTION_STATUS_PHASE_1 } from './section-statuses'

const preparePassageEntities = (studentSectionId: string) => R.map(
  R.pipe(
    R.pick(['content', 'order', 'questions', 'id', 'is_false_passage']),
    R.mergeLeft({
      student_section_id: studentSectionId,
    })
  )
)

const createSection = (studentExamId: string) => async originalSection => {
  const section = await create(
    makeDTO(
      studentExamId,
      originalSection.title,
      originalSection.order,
      originalSection.full_title
    )
  )

  await R.pipeWith(R.andThen)([
    asAsync(
      R.prop('passages')
    ),
    preparePassageEntities(section.id),
    createStudentExamPassages,
  ])(originalSection)
}

export const cretateExamSectionsFromOriginalSections = (studentExamId: string) => async originalSections => (
  mapP(
    createSection(studentExamId)
  )(originalSections)
)

export const changeSectionStatus = async (id: string, section_status: string) => (
  patch(id, {
    section_status,
  })
)

export const breachSection = async (id: string) => (
  patch(id, {
    is_intact: false,
  })
)

export const finishSection = async id => (
  patch(id, {
    is_finished: true,
  })
)

export const resetSection = async id => (
  patch(id, {
    section_status: SECTION_STATUS_PHASE_1,
    is_intact: true,
    is_finished: false,
  })
)
