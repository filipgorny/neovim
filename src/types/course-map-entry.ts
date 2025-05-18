import { CourseMapTypes } from '../modules/course-map/course-map-types'

export type CourseMapEntry = {
  id: string,
  book_course_id: string,
  title: string,
  external_id: string,
  type: CourseMapTypes,
  metadata?: object,
}

export type CourseMapEntryDTO = Omit<CourseMapEntry, 'id'>
