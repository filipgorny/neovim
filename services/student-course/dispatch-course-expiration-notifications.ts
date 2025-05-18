import moment from 'moment'
import * as R from 'ramda'
import { collectionToJson } from '../../utils/model/collection-to-json'
import renameProps from '../../utils/object/rename-props'
import { courseExpiresInThreeDays } from '../notification/notification-dispatcher'
import { findCoursesToExpireInThreeDays } from '../../src/modules/student-courses/student-course-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'

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
    title: 'courseTitle',
    accessible_to: 'accessibleTo',
  }),
  R.evolve({
    accessibleTo: formatDate,
  })
)

const dispatchExpiryNotification = R.pipe(
  extractNotificationData,
  R.tap(console.log),
  courseExpiresInThreeDays
)

export const dispatchCourseExpirationThreeDays = async () => {
  console.log('dispatchCourseExpirationThreeDays')

  return R.pipeWith(R.andThen)([
    findCoursesToExpireInThreeDays,
    R.prop('data'),
    collectionToJson,
    mapP(dispatchExpiryNotification),
  ])(true)
}
