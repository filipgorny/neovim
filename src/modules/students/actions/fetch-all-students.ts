import { FetchQueryParam } from '../../../types/fetch-query'
import { findStudents } from '../student-repository'
import { findOne } from '../../student-courses/student-courses-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'

const attachSingleCourse = async (students) => {
  const data = await mapP(async (student) => {
    if (student.active_courses === 1) {
      const course = await findOne({ student_id: student.id })

      student.course = course
    }

    return student
  })(students.data)

  return {
    ...students,
    data,
  }
}

export default async (query: FetchQueryParam) => {
  const data = await findStudents(query, query.filter)

  // Embed the course if there is only one active course
  return attachSingleCourse(data)
}
