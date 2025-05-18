import R from 'ramda'
import { collectionToJson } from '../../utils/model/collection-to-json'
import mapP from '../../utils/function/mapp'
import renameProps from '../../utils/object/rename-props'
import { fetchFirstMasterAmin } from '../../src/modules/admins/admin-repository'
import { expireStudentCourse } from '../../src/modules/student-courses/student-course-service'
import moment from 'moment'
import { courseExpired } from '../notification/notification-dispatcher'
import { fetchCoursesThatShouldBeExpired, findCoursesThatShouldBeExpired } from '../../src/modules/student-courses/student-course-repository'
import { processInBatches } from '../../services/batch/batch-processor'

const RECORDS_PER_BATCH = 10

const formatDate = dateStr => moment(dateStr).format('dddd, MMMM D, YYYY')
const log = batchNumber => console.log(`-> expire courses; batch ${batchNumber}`)

const extractNotificationData = R.pipe(
  R.juxt([
    R.pick(['title', 'accessible_to']),
    R.pipe(
      R.path(['student', 'email']),
      R.objOf('email')
    ),
  ]),
  R.mergeAll,
  renameProps({
    title: 'courseTitle',
    accessible_to: 'expiryDate',
  }),
  R.evolve({
    expiryDate: formatDate,
  })
)

const dispatchCourseExpiredNotification = async course => (
  R.pipe(
    extractNotificationData,
    courseExpired
  )(course)
)

export const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    fetchCoursesThatShouldBeExpired(batchNumber, step),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const processBatch = (adminId: string) => async (batch, _, batchNumber) => {
  log(batchNumber)

  await mapP(expireStudentCourse(adminId))(batch)

  return mapP(dispatchCourseExpiredNotification)(batch)
}

export const updateExpiredStudentCourses = async () => {
  const admin = await fetchFirstMasterAmin()

  return processInBatches(nextBatch, processBatch(admin.id), RECORDS_PER_BATCH)
}
