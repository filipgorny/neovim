import { CourseMapTypes } from '../../course-map/course-map-types'

export type VideoCategoryDTO = {
  title: string
  course_id: string
  course_type: CourseMapTypes
  end_date_id?: string
  is_hidden?: boolean
}

export const makeDTO = (title: string, course_id: string, course_type: CourseMapTypes, end_date_id?: string): VideoCategoryDTO => ({
  title,
  course_id,
  course_type,
  end_date_id,
})

export default VideoCategoryDTO
