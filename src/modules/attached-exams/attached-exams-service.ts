import * as R from 'ramda'
import { create, detachManyByParent, findOneOrFail, patchWhere } from './attached-exam-repository'
import { AttachedExamType, AttachedExamTypeEnum } from './attached-exam-types'
import { makeDTO } from './dto/attached-exam-dto'
import orm from '../../models'

const { knex } = orm.bookshelf

export const createAttachedExam = async (type: AttachedExamType, exam_id: string, attached_id: string, is_free_trial: boolean = false) => (
  create(
    makeDTO(type, exam_id, attached_id, is_free_trial)
  )
)

export const detachAllByCourse = async (course_id: string) => (
  detachManyByParent(course_id, AttachedExamTypeEnum.course)
)

export const toggleFreeTrialExam = async (course_id: string, exam_id: string) => {
  const attachedExam = await findOneOrFail({ attached_id: course_id, exam_id })

  const wasFreeTrial = attachedExam.is_free_trial

  return wasFreeTrial ? patchWhere({ attached_id: course_id, exam_id }, { is_free_trial: false, free_trial_featured_exam: false }) : patchWhere({ attached_id: course_id, exam_id }, { is_free_trial: true })
}

export const toggleFeaturedFreeTrialExam = async (course_id: string, exam_id: string) => {
  const attachedExam = await findOneOrFail({ attached_id: course_id, exam_id })

  const wasFeatured = attachedExam.free_trial_featured_exam

  return wasFeatured ? patchWhere({ attached_id: course_id, exam_id }, { free_trial_featured_exam: false }) : patchWhere({ attached_id: course_id, exam_id }, { free_trial_featured_exam: true, is_free_trial: true })
}

export const copyAttachedExamForNewCourse = (newCourseId: string) => async (attachedExam) => {
  const payload = {
    ...attachedExam,
    attached_id: newCourseId,
  }

  return create(
    R.omit(['id'])(payload)
  )
}
