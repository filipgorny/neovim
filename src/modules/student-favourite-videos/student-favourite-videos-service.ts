import * as R from 'ramda'
import { findOneOrFail as findContentResource } from '../student-book-content-resources/student-book-content-resource-repository'
import { create, deleteWhere, findAllByStudentId, findOne } from './student-favourite-videos-repository'

export const markVideoResourceAsFavourite = async (student_id: string, resource_id: string, course_id: string) => {
  const favouriteVideo = await findOne({ student_id, resource_id, course_id })

  if (favouriteVideo) {
    return
  }

  const contentResource = await findContentResource({ id: resource_id })

  return create({ student_id, resource_id, video_id: contentResource.external_id, course_id })
}

export const unmarkVideoResourceAsFavourite = async (student_id: string, resource_id: string, course_id: string) => (
  deleteWhere({ student_id, resource_id, course_id })
)

export const findFavouriteVideos = async (student_id: string, course_id: string) => (
  findAllByStudentId(student_id, course_id)
)
