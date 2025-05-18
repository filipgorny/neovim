import * as R from 'ramda'
import { deleteCompletely, findOne, update, updateById, upsert, findOneOrFail, patch, findStudentByPhoneNumber, findStudentByPhoneNumberAndEmail, softDeleteByIds } from './student-repository'
import { makeDTO } from './dto/student-dto'
import { notFoundExceptionWithID } from '../../../utils/error/error-factory'
import { saltyBucksBalanceChanged } from '../../../services/notification/notification-dispatcher'
import { create } from '../salty-bucks-log/salty-bucks-log-repository'
import { SaltyBucksOperationType } from '../salty-bucks-log/salty-bucks-operation-type'
import { SaltyBucksSource } from '../salty-bucks-log/salty-bucks-source'
import { SaltyBucksReferenceType } from '../salty-bucks-log/salty-bucks-reference-type'
import moment from 'moment-timezone'
import { SaltyBucksOperationSubtype } from '../salty-bucks-log/salty-bucks-operation-subtype'
import { FlashcardStudyMode } from './flashcard-study-modes'
import { customException, throwException } from '@desmart/js-utils'
import orm from '../../models'
import { deleteWhere as deleteStudentTokenWhere } from '../../modules/student-tokens/student-tokens-repository'
import { deleteWhere as deleteUserWhere } from '../../modules/users/users-repository'
import { increaseSaltyBucksForTransferingProducts } from '../../../services/salty-bucks/salty-buck-service'
import logger from '../../../services/logger/logger'
import { getPayloadFromLikiRequestToken } from '../student-exams/actions/purchase-exam'
import validateEntityPayload from '@desmart/js-utils/dist/validation/validate-entity-payload'
import { schema as likiStudentTokenSchema } from '../../modules/student-courses/validation/schema/purchase-course-token-payload-schema'
import { getSetting } from '../settings/settings-service'
import { Settings } from '../settings/settings'
import { Request } from 'express'
import createOnboardingTasks from '../student-tasks/actions/create-getting-started-tasks'
import { resetStudentTasks } from '../student-tasks/student-task-service'

const { knex } = orm.bookshelf

interface SetSaltyBucksBalanceCommand {
  studentId: string
  adminId: string
  saltyBuckBalance: number
}

export const syncStudent = async (email: string, name: string, phoneNumber: string, saltyBucksBalance: number, username?: string, external_id?: number) => {
  const student = await upsert(
    makeDTO(email, name, phoneNumber, saltyBucksBalance, true, username, external_id)
  )

  return student
}

export const patchOwnedProducts = async (student_id: string, has_books: boolean, has_exams: boolean, has_courses: boolean) => (
  update(student_id, { has_books, has_exams, has_courses })
)

export const setSaltyBucksBalance = async (command: SetSaltyBucksBalanceCommand) => {
  const student = await findOne({ id: command.studentId })

  if (!student) {
    throw notFoundExceptionWithID('Student', command.studentId)
  }

  const updatedItem = await updateById({ id: command.studentId, data: { salty_bucks_balance: command.saltyBuckBalance } })

  let operationType = SaltyBucksOperationType.income
  let amount = command.saltyBuckBalance - student.salty_bucks_balance

  if (amount < 0) {
    amount *= -1
    operationType = SaltyBucksOperationType.outcome
  }

  await create({
    amount,
    operation_type: operationType,
    student_id: command.studentId,
    metadata: '{}',
    source: SaltyBucksSource.platform,
    reference_id: command.adminId,
    reference_type: SaltyBucksReferenceType.admin,
    created_at: new Date(),
    operation_subtype: SaltyBucksOperationSubtype.adminSetBalance,
  })

  await saltyBucksBalanceChanged({
    email: updatedItem.email,
    saltyBucks: command.saltyBuckBalance,
    action: student.salty_bucks_balance > updatedItem.salty_bucks_balance ? 'decreased' : 'increased',
  })

  return updatedItem
}

const getBalanceFromStudent = R.pipe(
  R.propOr(0, 'salty_bucks_balance'),
  parseInt
)

export const increaseSaltyBucksBalance = async (student_id: string, amount) => {
  const student = await findOneOrFail({ id: student_id })

  return patch(student_id, {
    salty_bucks_balance: getBalanceFromStudent(student) + parseInt(amount),
  })
}

export const decreaseSaltyBucksBalance = async (student_id: string, amount, trx?) => {
  const student = await findOneOrFail({ id: student_id })

  return patch(student_id, {
    salty_bucks_balance: getBalanceFromStudent(student) - parseInt(amount),
  }, trx)
}

export const patchSiteActivity = async (student_id: string, duration: number) => (
  update(student_id, {
    [`activity_streak_${duration}min`]: moment(),
  })
)

export const setFlashcardStudyMode = async (student_id: string, mode: FlashcardStudyMode) => (
  update(student_id, {
    flashcard_study_mode: mode,
  })
)

export const setUsername = async (student_id: string, username: string) => (
  update(student_id, { username })
)

export const setName = async (student_id: string, name: string) => (
  update(student_id, { name })
)

export const setPhoneNumber = async (student_id: string, phone_number: string) => (
  update(student_id, { phone_number })
)

export const setEmail = async (student_id: string, email: string) => (
  update(student_id, { email })
)

export const setExternalId = async (student_id: string, external_id: string) => (
  update(student_id, { external_id })
)

export const getUsername = async (student_id: string) => {
  const student = await findOneOrFail({ id: student_id })
  return student.username
}

export const findStudent = async (student_id: string) => (
  findOneOrFail({ id: student_id })
)

export const findStudentByEmail = async (email: string) => (
  findOneOrFail({ email })
)

export const findStudentByExternalId = async (external_id: string) => (
  findOneOrFail({ external_id })
)

export const existsStudentWithPhoneNumber = async (phoneNumber: string) => {
  const student = await findStudentByPhoneNumber(phoneNumber)

  return !!student
}

export const existsStudentWithPhoneNumberAndEmail = async (phoneNumber: string, email: string) => {
  const student = await findStudentByPhoneNumberAndEmail(phoneNumber, email)

  return !!student
}

export const markSupportTabSeen = async (student_id: string) => (
  update(student_id, { support_tab_seen: true })
)

export const setTimezone = async (student_id: string, timezone: string) => {
  if (!moment.tz.names().includes(timezone)) {
    throwException(customException('students.invalid-timezone', 400, 'Invalid timezone'))
  }
  return update(student_id, { timezone, use_default_timezone: false })
}

export const useDefaultTimezone = async (student_id: string) => (
  update(student_id, { use_default_timezone: true })
)

export const dontUseDefaultTimezone = async (student_id: string) => (
  update(student_id, { use_default_timezone: false })
)

export const setVideoBgMusic = async (student_id: string, video_bg_music_enabled: boolean) => (
  update(student_id, { video_bg_music_enabled })
)

export const setCqAnimations = async (student_id: string, cq_animations_enabled: boolean) => (
  update(student_id, { cq_animations_enabled })
)

export const setTheme = async (student_id: string, theme: string) => (
  update(student_id, { theme })
)

export const markOnboardingAsSeen = async (student_id: string) => (
  update(student_id, { is_onboarding_seen: true })
)

export const markGettingStartedAsCompleted = async (student_id: string) => (
  update(student_id, { is_getting_started_completed: true })
)

export const markGettingStartedAsIncomplete = async (student_id: string) => (
  update(student_id, { is_getting_started_completed: false })
)

export const resetGettingStarted = async (student_id: string) => {
  await resetStudentTasks(student_id)

  return update(student_id, { is_getting_started_completed: false })
}

/**
 * This method updates student's login count but to a total value of 3.
 * This is used to display onboarding modal to students who have logged in every 3 times.
 */
export const bumpLoginCount = async (student) => {
  const login_count = student.login_count === 3 ? 1 : student.login_count + 1

  return update(student.id, { login_count, logged_at: moment() })
}

const relations = {
  courses: 'student_courses',
  exams: 'student_exams',
  books: 'student_books',
  courseExtentions: 'course_extensions',
  aminoAcidGames: 'amino_acid_games',
  saltyBucksLogs: 'salty_bucks_logs',
  notifications: 'student_notifications',
  completionMeters: 'student_completion_meters',
  courseActivityTimers: 'student_course_activity_timers',
  pinVariants: 'student_pin_variants',
  videoRatings: 'student_video_ratings',
  bookActivityTimers: 'student_book_activity_timers',
  bookContentsRead: 'student_book_contents_read',
  flashcardActivityTimers: 'flashcard_activity_timers',
  bookChapterActivityTimers: 'student_book_chapter_activity_timers',
  bookSubchapterNotes: 'student_book_subchapter_notes',
  favouriteVideos: 'student_favourite_videos',
  videoActivityTimers: 'video_activity_timers',
  // stopWatches: 'stopwatches', // we will update these records in a slightly different way

  // we will remove the below records for the fromStudent

  // saltyBucksDailyLogs: 'salty_bucks_daily_log',
  // examScores: 'student_exam_scores',
  // token: 'student_tokens',
  // user: 'users',
}

export const transferProductsAndRemoveOldStudent = async (from_student_id: string, to_student_id: string): Promise<void> => {
  logger.info(`Transferring products from ${from_student_id} to ${to_student_id}`)
  const fromStudent = await findOneOrFail({ id: from_student_id }, ['stopWatches'])

  for (const item of fromStudent.stopWatches) {
    await knex('stopwatches').update({ student_id: to_student_id }).where(item)
  }

  logger.debug(`Removig salty bucks daily logs for the fromStudent with id=${from_student_id}`)
  await knex('salty_bucks_daily_log').where({ student_id: from_student_id }).delete()
  await increaseSaltyBucksForTransferingProducts(to_student_id, from_student_id)

  // We are probably not using this table anymore, and we forgot what it is for, so yeah, we are not transfering it
  logger.debug(`Removig exam scores for the fromStudent with id=${from_student_id}`)
  await knex('student_exam_scores').where({ student_id: from_student_id }).delete()

  for (const [relation, table] of Object.entries(relations)) {
    logger.debug(`Transferring ${relation} from ${from_student_id} to ${to_student_id}`)
    const fromStudent = await findOneOrFail({ id: from_student_id }, [relation])

    for (const item of fromStudent[relation]) {
      await knex(table).update({ student_id: to_student_id }).where({ id: item.id })
    }
  }

  logger.debug(`Removig student tokens for the fromStudent with id=${from_student_id}`)
  await deleteStudentTokenWhere({ student_id: from_student_id })
  logger.debug(`Removig users for the fromStudent with id=${from_student_id}`)
  await deleteUserWhere({ email: fromStudent.email })
  logger.debug(`Removig student with id=${from_student_id}`)
  await deleteCompletely(from_student_id)
}

export const removeStudentAccount = async (student_id: string) => {
  const fromStudent = await findOneOrFail({ id: student_id }, ['stopWatches'])

  for (const item of fromStudent.stopWatches) {
    await knex('stopwatches').where({ student_id }).delete()
  }

  await knex('salty_bucks_daily_log').where({ student_id }).delete()

  await knex('student_exam_scores').where({ student_id }).delete()

  for (const [relation, table] of Object.entries(relations)) {
    if (relation !== 'courses') {
      // we will handle courses this later
      const fromStudent = await findOneOrFail({ id: student_id }, [relation])

      // delete
      for (const item of fromStudent[relation]) {
        await knex(table).where({ student_id: student_id }).delete()
      }
    }
  }

  await deleteStudentTokenWhere({ student_id: student_id })
  await deleteUserWhere({ email: fromStudent.email })
  await deleteCompletely(student_id)
}

export const removeStudentAccountSoftly = async (student_id: string) => {
  const fromStudent = await findOneOrFail({ id: student_id }, ['stopWatches'])

  for (const item of fromStudent.stopWatches) {
    await knex('stopwatches').where({ student_id }).delete()
  }

  await knex('salty_bucks_daily_log').where({ student_id }).delete()

  await knex('student_exam_scores').where({ student_id }).delete()

  for (const [relation, table] of Object.entries(relations)) {
    if (relation !== 'courses') {
      // we will handle courses this later
      const fromStudent = await findOneOrFail({ id: student_id }, [relation])

      // delete
      for (const item of fromStudent[relation]) {
        await knex(table).where({ student_id: student_id }).delete()
      }
    }
  }

  await deleteStudentTokenWhere({ student_id: student_id })
  await deleteUserWhere({ email: fromStudent.email })
  await softDeleteByIds({ ids: [student_id] })
}

export const getStudentByLikiRequest = async (request: Request) => {
  const tokenPayload = await getPayloadFromLikiRequestToken(request)

  logger.info('getStudentByLikiRequest', { tokenPayload })

  validateEntityPayload(likiStudentTokenSchema)(tokenPayload)

  const { external_student_id } = tokenPayload
  let student = await findStudentByExternalId(external_student_id)

  if (student.deleted_at) {
    await patch(student.id, { external_id: null })
    student = await upsert({
      email: student.email,
      name: student.name,
      phone_number: student.phone_number,
      salty_bucks_balance: await getSetting(Settings.SaltyBucksStartingBalance),
      external_id: external_student_id,
    })
  }

  return student
}

export const hasCourses = async (student_id: string) => {
  const courses = await knex('student_courses').where({ student_id, is_deleted: false })

  return courses.length > 0
}

export const hasExams = async (student_id: string) => {
  const exams = await knex('student_exams').where({ student_id })

  return exams.length > 0
}

export const hasProducts = async (student_id: string) => ({
  has_courses: await hasCourses(student_id),
  has_exams: await hasExams(student_id),
})

export const resetWalletBalance = async (student_id: string) => (
  update(student_id, { wallet_balance: 0 })
)

export const freezeAccount = async (student_id: string, freeze_reason: string) => (
  patch(student_id, {
    is_frozen: true,
    freeze_reason,
    frozen_at: moment().toDate(),
  })
)

export const unfreezeAccount = async (student_id: string) => (
  patch(student_id, {
    is_frozen: false,
  })
)

export const setAdminNote = async (student_id: string, admin_note: string) => (
  patch(student_id, {
    admin_note,
  })
)
