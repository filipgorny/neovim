import * as R from 'ramda'
import moment, { Moment } from 'moment'
import { findOneOrFail as findAdminOrFail } from '../admins/admin-repository'
import NotificationDTO, { Notification } from './dto/notification-dto'
import { NotificationType } from './notification-type'
import { create, find, findOneOrFail, patch } from './notifications-repository'
import { DELETED_AT, customException, throwException } from '@desmart/js-utils'
import { getStudentIdAndStudentCourseIdPairsByStudentGroup } from '../courses/course-service'
import { StudentGroup } from './student-group-types'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { create as createStudentNotification } from '../student-notifications/student-notifications-repository'
import { DATETIME_DATABASE_FORMAT, DEFAULT_TIME_ZONE, POLLING_DELAY_IN_MINUTES, TIME_ZONE } from '../../constants'
import { find as findStudents } from '../students/student-repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { processInBatches } from '../../../services/batch/batch-processor'
import { sendNotificationToAllStudents, sendNotificationToStudents } from '../socket-servers/socket-servers-service'
import { RecurringEventDefinition, shouldDispatchRecurringNotification } from '../../../services/recurring-events/recurring-events-service'
import orm from '../../models'
import { StudentCourseTypes } from '../student-courses/student-course-types'
import logger from '../../../services/logger/logger'
import { findOneWithoutDeleted as findCourseWithoutDeleted } from '../courses/course-repository'
import { findOne as findCourseEndDate } from '../course-end-dates/course-end-dates-repository'
import asAsync from '../../../utils/function/as-async'
import { getEndDate } from '../course-end-dates/course-end-dates-service'
import { BookshelfEntity } from '../../types/bookshelf-entity'

const { knex } = orm.bookshelf

export const createNotification = async (payload: NotificationDTO): Promise<BookshelfEntity<Notification>> => {
  await findAdminOrFail({ id: payload.author_id })

  if (payload.type === NotificationType.scheduled && !payload.scheduled_for) {
    throwException(customException('notifications.scheduled-for-is-required', 403, 'Scheduled for is required'))
  }

  if (payload.type === NotificationType.recurring && !payload.recurring_definition) {
    throwException(customException('notifications.recurring-definition-is-required', 403, 'Recurring definition is required'))
  }

  const notification = await create({
    ...payload,
    student_groups: JSON.stringify(payload.student_groups),
    ...(payload.recurring_definition ? { recurring_definition: JSON.stringify(payload.recurring_definition) } : {}),
  })

  if (payload.type === NotificationType.immediate) {
    await sendNotification(notification.toJSON())
  }

  return notification
}

export const updateNotification = async (id: string, payload: Partial<NotificationDTO>): Promise<BookshelfEntity<Notification>> => {
  const notification = await findOneOrFail({ id })

  if (((payload.type && payload.type === NotificationType.scheduled) || (notification.type === NotificationType.scheduled)) && (!payload.scheduled_for && !notification.scheduled_for)) {
    throwException(customException('notifications.scheduled-for-is-required', 403, 'Scheduled for is required'))
  }

  if (((payload.type && payload.type === NotificationType.recurring) || (notification.type === NotificationType.recurring)) && (!payload.recurring_definition && !notification.recurring_definition)) {
    throwException(customException('notifications.recurring-definition-is-required', 403, 'Recurring definition is required'))
  }

  return patch(id, {
    ...payload,
    student_groups: payload.student_groups ? JSON.stringify(payload.student_groups) : undefined,
    ...(payload.recurring_definition ? { recurring_definition: JSON.stringify(payload.recurring_definition) } : {}),
  })
}

export const sendNotification = async (notification: Notification): Promise<void> => {
  const studentGroups: StudentGroup[] = typeof notification.student_groups === 'string'
    ? JSON.parse(notification.student_groups)
    : [...notification.student_groups.map(el => ({ ...el }))]
  let studentIds

  for (const studentGroup of studentGroups) {
    logger.info(`Sending notification to students from group ${JSON.stringify(studentGroup)}`)

    if (studentGroup.type === StudentCourseTypes.liveCourse && studentGroup.expires_at && R.equals(studentGroup.expires_at.split('-').map(el => el.length), [2, 2, 4])) {
      const [MM, DD, YYYY] = studentGroup.expires_at.split('-')
      studentGroup.expires_at = [YYYY, MM, DD].join('-')
    }

    if (studentGroup.type === StudentCourseTypes.onDemand || studentGroup.type === StudentCourseTypes.freeTrial) {
      await knex.raw('select send_notification(?, ?, ?, ?, ?)', [notification.author_id, notification.id, studentGroup.type, studentGroup.course_id, studentGroup.days_amount ?? null])
      studentIds = await knex.raw('select get_target_students(?, ?, ?)', [studentGroup.type, studentGroup.course_id, studentGroup.days_amount ?? null])
    } else if (studentGroup.type === StudentCourseTypes.liveCourse) {
      await knex.raw('select send_notification(?, ?, ?, ?, ?, ?, ?)', [notification.author_id, notification.id, studentGroup.type, studentGroup.course_id, null, studentGroup.end_date_id ?? null, studentGroup.expires_at ?? null])
      studentIds = await knex.raw('select get_target_students(?, ?, ?, ?, ?)', [studentGroup.type, studentGroup.course_id, null, studentGroup.end_date_id ?? null, studentGroup.expires_at ?? null])
    }

    studentIds = R.pluck('get_target_students')(studentIds.rows)

    sendNotificationToStudents(studentIds)
  }

  if (studentGroups.length === 0) {
    console.log('Sending notification to all students')

    await knex.raw('select send_notification(?, ?)', [notification.author_id, notification.id])

    sendNotificationToAllStudents()
  }
}

export const sendNotificationById = async (id: string): Promise<void> => {
  const notification = await findOneOrFail({ id })

  await sendNotification(notification)
}

export const prepareNotification = async notification => {
  const studentGroups = typeof notification.student_groups === 'string' ? JSON.parse(notification.student_groups) : notification.student_groups

  for (const studentGroup of studentGroups) {
    const course = await findCourseWithoutDeleted({ id: studentGroup.course_id })

    if (!course) {
      studentGroup.is_course_removed = true
    } else {
      studentGroup.is_course_removed = false
      studentGroup.course_title = course.title
    }

    if (studentGroup.type === StudentCourseTypes.liveCourse) {
      if (studentGroup.end_date_id) {
        const endDate = await findCourseEndDate({ id: studentGroup.end_date_id })

        if (!endDate) {
          studentGroup.is_end_date_removed = true
        } else {
          studentGroup.is_end_date_removed = false
          studentGroup.selected_year = moment(endDate.end_date).year()
          studentGroup.class_date_label = moment(endDate.end_date).format('MM-DD-YYYY')
        }
      } else if (studentGroup.expires_at) {
        const expiresAt = new Date(studentGroup.expires_at)
        const endDate = await getEndDate(studentGroup.course_id, expiresAt)

        if (!endDate) {
          studentGroup.is_end_date_removed = true
        } else {
          studentGroup.is_end_date_removed = false
        }

        studentGroup.selected_year = moment(expiresAt).year()
        studentGroup.class_date_label = moment(expiresAt).format('MM-DD-YYYY')
      }
    }
  }

  notification.student_groups = typeof notification.student_groups === 'string' ? JSON.stringify(studentGroups) : studentGroups

  return notification
}

export const fetchNotifications = async (limit?: { page: number, take: number }, order?: { by: string, dir: 'asc' | 'desc' }, filter?, courseIds?: string[]) => (
  R.pipeWith(R.andThen)([
    async () => find(
      { limit: limit || { page: 1, take: 10 }, order: order || { by: 'created_at', dir: 'desc' } },
      function () {
        this.where(filter || {}) // .whereNull(DELETED_AT) -- now we want to fetch deleted notifications

        if (courseIds?.length) {
          this.andWhere(function () {
            courseIds.forEach((course_id, index) => {
              if (index === 0) {
                this.whereRaw(`student_groups::text ~ '"course_id":"${course_id}"'`)
              } else {
                this.orWhereRaw(`student_groups::text ~ '"course_id":"${course_id}"'`)
              }
            })
          })
        }
      }
    ),
    // Add course title to student groups
    async response => {
      const data = await R.pipeWith(R.andThen)([
        asAsync(R.prop('data')),
        collectionToJson,
        mapP(prepareNotification),
      ])(response)

      return {
        data,
        meta: response.meta,
      }
    },
  ])(true)
)

export const sendOutRecurringNotifications = async (now): Promise<void> => {
  const RECORDS_PER_BATCH = 20

  now = now.toDate()

  const log = batchNumber => console.log(`-> send out recurring notifications; batch ${batchNumber}`)

  const nextBatch = async (batchNumber, step) => (
    R.pipeWith(R.andThen)([
      async () => find({
        limit: {
          page: batchNumber + 1,
          take: step,
        },
        order: { by: 'created_at', dir: 'asc' },
      }, function () {
        this.whereNull(DELETED_AT).where('type', NotificationType.recurring).where('is_paused', false)
      }),
      R.prop('data'),
      collectionToJson,
    ])(true)
  )

  const processBatch = async (batch, _, batchNumber) => {
    log(batchNumber)

    return mapP(async (notification) => {
      if (shouldDispatchRecurringNotification(JSON.parse(notification.recurring_definition) as RecurringEventDefinition, now)) {
        await sendNotification(notification)
      }
    })(batch)
  }

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)
}

export const sendOutScheduledNotifications = async (now: Moment): Promise<void> => {
  const RECORDS_PER_BATCH = 20

  const log = batchNumber => console.log(`-> send out scheduled notifications; batch ${batchNumber}`)

  const nextBatch = async (batchNumber, step) => (
    R.pipeWith(R.andThen)([
      async () => find({
        limit: {
          page: batchNumber + 1,
          take: step,
        },
        order: { by: 'created_at', dir: 'asc' },
      }, function () {
        this.whereNull(DELETED_AT)
          .where('type', NotificationType.scheduled)
          .where('scheduled_for', '>', moment(now.toDate()).subtract(POLLING_DELAY_IN_MINUTES, 'minutes').toDate())
          .where('scheduled_for', '<=', now.toDate())
          .where('is_paused', false)
      }),
      R.prop('data'),
      collectionToJson,
      R.tap(data => console.log({ scheduledNotificationBatch: data })),
    ])(true)
  )

  const processBatch = async (batch, _, batchNumber) => {
    log(batchNumber)

    return mapP(sendNotification)(batch)
  }

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)
}

export const sendOutNotifications = async (): Promise<void> => {
  console.log('Sending out notifications')

  const now: Moment = moment()

  await sendOutRecurringNotifications(now)
  await sendOutScheduledNotifications(now)
}
