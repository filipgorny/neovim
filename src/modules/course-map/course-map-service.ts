import { create, patch, deleteRecord, deleteByCourseId } from './course-map-repository'

export const createCourseMapEntry = async (dto: {}) => (
  create(dto)
)

export const updateCourseMapEntry = async (id: string, data: {}) => (
  patch(id, data)
)

export const deleteCourseMapEntry = async (id: string) => (
  deleteRecord(id)
)

export const deleteByCourse = async (course_id: string) => (
  deleteByCourseId(course_id)
)
