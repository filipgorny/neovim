import { StudentCourse } from '../../../types/student-course'
import { pinNotePresenceInCourseBySubchapters } from '../student-book-content-pins-repository'

export default async (studentCourse: StudentCourse, query) => (
  pinNotePresenceInCourseBySubchapters(studentCourse.id, query)
)
