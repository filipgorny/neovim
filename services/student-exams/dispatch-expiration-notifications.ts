import moment from 'moment'
import * as R from 'ramda'
import {
  findFullExamsToExpireInTwoDays,
  findFullExamsToExpireToday
} from '../../src/modules/student-exams/student-exam-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import renameProps from '../../utils/object/rename-props'
import { examExpiresInTwoDays, examExpired } from '../notification/notification-dispatcher'
import { expireStudentExam } from '../../src/modules/student-exams/student-exam-service'
import { fetchFirstMasterAmin } from '../../src/modules/admins/admin-repository'

const formatDate = dateStr => moment(dateStr).format('dddd, MMMM D, YYYY')

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
    title: 'examTitle',
    accessible_to: 'expiryDate',
  }),
  R.evolve({
    expiryDate: formatDate,
  })
)

const dispatchExpiryNotification = R.pipe(
  extractNotificationData,
  examExpiresInTwoDays
)

const dispatchExamExpiredNotification = R.pipe(
  extractNotificationData,
  examExpired
)

export const dispatchExamExpirationTwoDays = async () => {
  console.log('dispatchExamExpirationTwoDays (DISABLED)')

  return true
  // return R.pipeWith(R.andThen)([
  //   findFullExamsToExpireInTwoDays,
  //   R.prop('data'),
  //   collectionToJson,
  //   R.map(dispatchExpiryNotification),
  // ])(true)
}

export const dispatchExamExpiredToday = async () => {
  console.log('dispatchExamExpiredToday (DISABLED)')

  // const admin = await fetchFirstMasterAmin()
  // const exams = await R.pipeWith(R.andThen)([
  //   findFullExamsToExpireToday,
  //   R.prop('data'),
  //   collectionToJson,
  // ])(true)

  // await mapP(
  //   // @ts-ignore
  //   expireStudentExam(admin.id)
  // )(exams)

  return true
  // return R.map(dispatchExamExpiredNotification)(exams)
}
