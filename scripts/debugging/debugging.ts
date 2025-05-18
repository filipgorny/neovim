import * as R from 'ramda'
import prompts from 'prompts'
import orm, { Notification } from '../../src/models'
import { sendNotification, sendOutNotifications } from '../../src/modules/notifications/notifications-service'
import { makeDTO } from '../../src/modules/notifications/dto/notification-dto'
import { NotificationType } from '../../src/modules/notifications/notification-type'
import { find, getStudentIdsByNotification } from '../../src/modules/notifications/notifications-repository'
import { removeOldStudentNotifications } from '../../src/modules/student-notifications/student-notifications-repository'
import moment from 'moment'
import { DELETED_AT } from '@desmart/js-utils'
import { DATETIME_DATABASE_FORMAT, POLLING_DELAY_IN_MINUTES } from '../../src/constants'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { registerSocketClient } from '../../src/sockets/socket-client'
// import { initializeSectionScoreMap } from '../../src/modules/exam-section-score-map/exam-section-score-map-service'

const { knex } = orm.bookshelf

registerSocketClient();

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Starting debugging script...')

  // await sendOutNotifications()
  const studentIds = await getStudentIdsByNotification('30500a65-6a75-43ef-9fcc-8bb571d636a7')

  console.log(studentIds)

  process.exit(0)
})()
