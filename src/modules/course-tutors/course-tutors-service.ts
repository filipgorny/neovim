import * as R from 'ramda'
import { create, patch, findOne } from './course-tutors-repository'

export const createTutor = async (course_id: string, name: string, bio: string, is_active: boolean, image_url?: string) => (
  create({
    course_id,
    name,
    bio,
    is_active,
    image_url,
  })
)

export const patchTutor = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const toggleTutorIsActive = async (id: string) => {
  const tutor = await findOne({ id })

  return patch(id, { is_active: !tutor.is_active })
}

export const deleteEntity = async (id: string) => (
  patch(id, { deleted_at: new Date() })
)

export const copyTutorForNewCourse = (newCourseId: string) => async (tutor) => {
  const newTutor = {
    ...tutor,
    course_id: newCourseId,
  }

  return create(
    R.omit(['id'])(newTutor)
  )
}
