import * as R from 'ramda'
import { create, patch, deleteRecord } from './course_end_date_days-repository'
import { findOne as findTutor } from '../course-tutors/course-tutors-repository'

export const createEntity = async (dto: {}) => (
  create(dto)
)

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)

export const copyEndDateDays = async (newEndDateId: string, days: object[], newTutors: object[]) => {
  await Promise.all(R.map(async day => {
    let courseTutorId = null

    if (day.course_tutor_id) {
      // Find the original tutor in newTutors array by comparing names
      const originalTutor = await findTutor({ id: day.course_tutor_id })

      // @ts-ignore
      const newTutor = newTutors.find(t => t.name === originalTutor.name)

      if (newTutor) {
        // @ts-ignore
        courseTutorId = newTutor.id
      }
    }

    const newDay = {
      ...day,
      end_date_id: newEndDateId,
      course_tutor_id: courseTutorId,
    }

    return create(R.omit(['id'])(newDay))
  })(days))
}
