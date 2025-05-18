import { StudentCourseStatus } from '../../../student-courses/student-course-status'
import { StudentCourseTypes } from '../../../student-courses/student-course-types'
import { buildDaysOffForStudentCourse } from '../days-off-builder'

describe('days-off-builder', () => {
  it.skip('returns a day-off period with a public / bank holiday in it', () => {
    const studentCourse = {
      id: '',
      student_id: '',
      book_course_id: '',
      external_created_at: '2024-01-05',
      calendar_start_at: '2024-01-05',
      exam_at: '2024-06-06',
      title: '',
      subtitle: '',
      type: StudentCourseTypes.onDemand,
      status: StudentCourseStatus.ongoing,
    }

    const result = buildDaysOffForStudentCourse(studentCourse, true, 2024)

    expect(result).toEqual({ beginningOfWeek: '2024-01-15', endOfWeek: '2024-01-19' })
  })

  it.skip('returns a day-off period from the middle of the course (no holidays)', () => {
    const studentCourse = {
      id: '',
      student_id: '',
      book_course_id: '',
      external_created_at: '2024-01-05',
      calendar_start_at: '2024-02-20',
      exam_at: '2024-05-26',
      title: '',
      subtitle: '',
      type: StudentCourseTypes.onDemand,
      status: StudentCourseStatus.ongoing,
    }

    const result = buildDaysOffForStudentCourse(studentCourse, true, 2024)

    expect(result).toEqual({ beginningOfWeek: '2024-04-08', endOfWeek: '2024-04-12' })
  })
})
