import * as R from 'ramda'
import { processInBatches } from '../../../services/batch/batch-processor'
import { StudentCourse } from '../../types/student-course'
import { findStudentVideos } from '../student-videos/student-videos-repository'
import { findOne as findStudentBookVideo, create as createStudentBookVideo } from './student-book-videos-repository'
import forEachP from '../../../utils/function/foreachp'
import { markVideosAsMigrated } from '../student-courses/student-course-service'

const RECORDS_PER_BATCH = 25

const log = batchNumber => console.log(`-> migrate videos to student-book-videos; batch ${batchNumber}`)

const nextBatch = (studentCourse: StudentCourse) => async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    async () => findStudentVideos(studentCourse.student_id, studentCourse)({ limit: { page: batchNumber, take: RECORDS_PER_BATCH } }, {}),
    R.prop('data'),
  ])(true)
)

const handleSingleVideo = (studentCourse: StudentCourse) => async (video) => {
  const item = await findStudentBookVideo({ video_id: video.id, student_id: studentCourse.student_id })

  if (item) {
    return
  }

  await createStudentBookVideo({
    student_id: studentCourse.student_id,
    video_id: video.id,
    student_subchapter_id: video.student_subchapter_id,
    is_in_free_trial: video.is_free_trial && video.chapter_order === 1,
  })
}

const processBatch = (studentCourse: StudentCourse) => async (batch, _, batchNumber) => {
  log(batchNumber)

  return forEachP(handleSingleVideo(studentCourse))(batch)
}

export const migrateVideosToStudentBookVideos = (studentCourse: StudentCourse) => async () => {
  await processInBatches(nextBatch(studentCourse), processBatch(studentCourse), RECORDS_PER_BATCH, 1)

  await markVideosAsMigrated(studentCourse.id)
}
