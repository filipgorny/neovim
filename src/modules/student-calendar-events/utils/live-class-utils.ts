import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find as findBooks } from '../../student-books/student-book-repository'
import { find as findExams } from '../../student-exams/student-exam-repository'

export const getCalendarEventTitle = (bookChapterId, studentChapters) => (
  studentChapters[bookChapterId] ? `${studentChapters[bookChapterId].tag}_${studentChapters[bookChapterId].order}` : '?'
)

export const getActionUri = (bookChapterId, studentChapters, meetingUrl?: string) => {
  if (meetingUrl) {
    return meetingUrl
  }

  return studentChapters[bookChapterId] ? `/books/${studentChapters[bookChapterId].original_book_id}/chapter/${studentChapters[bookChapterId].order}/part/1` : '?'
}

export const getEventColour = (bookChapterId, studentChapters) => (
  studentChapters[bookChapterId] ? studentChapters[bookChapterId].tag_colour : ''
)

export const extractClassDays = R.pipe(
  R.prop('days'),
  R.reject(
    R.propSatisfies(book_chapter_id => R.isNil(book_chapter_id), 'book_chapter_id')
  )
)

export const extractExamDays = R.pipe(
  R.prop('days'),
  R.reject(
    R.propSatisfies(exam_id => R.isNil(exam_id), 'exam_id')
  )
)

export const fetchStudentExams = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findExams({ limit: { page: 1, take: 1000 }, order: { by: 'title', dir: 'asc' } }, { student_id: studentCourse.student_id }, ['originalExam']),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)

export const fetchStudentBooks = async (studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async studentCourse => findBooks({ limit: { page: 1, take: 1000 }, order: { by: 'title', dir: 'asc' } }, { course_id: studentCourse.id }, ['chapters.subchapters.contents.originalContent']),
    R.prop('data'),
    collectionToJson,
  ])(studentCourse)
)
