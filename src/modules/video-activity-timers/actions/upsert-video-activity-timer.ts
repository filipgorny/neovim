import * as R from 'ramda'
import { findOneOrFail as findResource } from '../../student-book-content-resources/student-book-content-resource-repository'
import { DATE_FORMAT_YMD, PREVIEW_STUDENT_EMAIL } from '../../../constants'
import { StudentCourse } from '../../../types/student-course'
import { upsertActivityTimer as upsertVideoActivityTimer } from '../video-activity-timers-service'
import moment from 'moment'

type Payload = {
  seconds: number
}

const isStudentPreview = user => (
  user.get('email') === PREVIEW_STUDENT_EMAIL
)

const getStudentBook = async (video_id: string) => (
  R.pipeWith(R.andThen)([
    async video_id => findResource({ id: video_id }, ['content.subchapter.chapter.book']),
    R.path(['content', 'subchapter', 'chapter', 'book']),
  ])(video_id)
)

export default async (user, video_id: string, studentCourse: StudentCourse, payload: Payload) => {
  if (isStudentPreview(user)) {
    return true
  }

  const book = await getStudentBook(video_id)

  return await upsertVideoActivityTimer({
    video_id: video_id,
    student_id: user.id,
    student_course_id: studentCourse.id,
    student_book_id: book.id,
    activity_date: moment().format(DATE_FORMAT_YMD),
  }, payload.seconds)
}
