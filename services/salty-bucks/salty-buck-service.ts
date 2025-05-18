import * as R from 'ramda'
import moment from 'moment'
import { customException, insufficientFundsException, throwException } from '../../utils/error/error-factory'
import { findByName as findSettingByName } from '../../src/modules/app-settings/app-settings-repository'
import { findOneOrFail as findStudent } from '../../src/modules/students/student-repository'
import { BookContentResourceTypeEnum } from '../../src/modules/book-content-resources/book-contennt-resource-types'
import { logIncome, logOutcome } from '../../src/modules/salty-bucks-log/salty-bucks-log-service'
import { decreaseSaltyBucksBalance, increaseSaltyBucksBalance, resetWalletBalance } from '../../src/modules/students/student-service'
import { getUnseenVideosInBookCount, getUnseenVideosInChaptersCount } from '../../src/modules/student-book-content-resources/student-book-content-resource-repository'
import { findOneOrFail } from '../../src/modules/videos/video-repository'
import { SaltyBucksOperationSubtype } from '../../src/modules/salty-bucks-log/salty-bucks-operation-subtype'
import { SaltyBucksReferenceType } from '../../src/modules/salty-bucks-log/salty-bucks-reference-type'
import mapP from '../../utils/function/mapp'
import { int } from '../../utils/number/int'
import { UserRole, UserRoleEnum } from '../../src/modules/users/user-roles'
import { findVideoRating } from '../../src/modules/student-video-ratings/student-video-ratings-service'
import logger from '../logger/logger'
import { findLastSiteActivity } from '../../src/modules/salty-bucks-log/salty-bucks-log-repository'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { StudentCourse } from '../../src/types/student-course'
import { increaseCurrentStudyStreak, resetCurrentStudyStreak } from '../../src/modules/student-courses/student-course-service'

const getLastSiteActivity = async studentId => (
  R.pipeWith(R.andThen)([
    findLastSiteActivity,
    R.prop('data'),
    collectionToJson,
    R.head,
  ])(studentId)
)

const handleActivityStreaks = async (studentCourse?: StudentCourse) => {
  // If for some reason studentCourse is not passed, return
  if (!studentCourse) {
    return
  }

  const lastActivity = await getLastSiteActivity(studentCourse.student_id)
  const activityDate = lastActivity?.created_at ? moment(lastActivity.created_at) : moment()
  const today = moment()
  const yesterday = moment().subtract(1, 'days')

  // Already recorded today's activity
  if (activityDate.isSame(today, 'day')) {
    return
  }

  if (activityDate.isSame(yesterday, 'day')) {
    await increaseCurrentStudyStreak(studentCourse)
  } else {
    await resetCurrentStudyStreak(studentCourse)
  }
}

const getSettingNameByResourceType = resource => {
  const settingName = R.pipe(
    R.prop('type'),
    R.cond([
      [R.equals(BookContentResourceTypeEnum.tmi), R.always('open_new_tmi')],
      [R.equals(BookContentResourceTypeEnum.mcat_think), R.always('open_new_mcat_think')],
      [R.equals(BookContentResourceTypeEnum.clinical_context), R.always('open_new_clinical_context')],
      [R.equals(BookContentResourceTypeEnum.video), R.always('watch_new_video')],
      [R.T, R.always(null)],
    ])
  )(resource)

  if (!settingName) {
    throwException(customException('Unknown student book resource type', 403))
  }

  return settingName
}

const unseenVideosInChapterCount = studentId => R.pipe(
  R.prop('studentResources'),
  R.map(
    R.path(['content', 'subchapter', 'chapter', 'id'])
  ),
  getUnseenVideosInChaptersCount(studentId)
)

const unseenVideosInBookCount = studentId => R.pipe(
  R.pluck('book_id'),
  getUnseenVideosInBookCount(studentId)
)

const getVideo = async (id: string) => (
  findOneOrFail({ id }, ['studentResources.content.subchapter.chapter.book'])
)

const watchedAllVideos = R.filter(
  R.propEq('unseen_count', '0')
)

const increaseSaltyBucksForAllVideosInChapter = studentId => async (obj: { chapter_id: string }) => {
  const setting = await findSettingByName(SaltyBucksOperationSubtype.watchAllVideosInChapter)

  await logIncome(studentId, setting.value, SaltyBucksOperationSubtype.watchAllVideosInChapter, obj.chapter_id, SaltyBucksReferenceType.chapter)
  await increaseSaltyBucksBalance(studentId, setting.value)
}

const increaseSaltyBucksForAllVideosInBook = studentId => async (obj: { book_id: string }) => {
  const setting = await findSettingByName(SaltyBucksOperationSubtype.watchAllVideosInBook)

  await logIncome(studentId, setting.value, SaltyBucksOperationSubtype.watchAllVideosInBook, obj.book_id, SaltyBucksReferenceType.book)
  await increaseSaltyBucksBalance(studentId, setting.value)
}

export const increaseSaltyBucksForTransferingProducts = async (studentId: string, fromStudentId: string) => {
  logger.debug(`increase salty bucks for transfering products from student ${fromStudentId} to student ${studentId}`)
  const fromStudent = await findStudent({ id: fromStudentId })

  await logIncome(studentId, fromStudent.salty_bucks_balance, SaltyBucksOperationSubtype.transferingProducts, fromStudentId, SaltyBucksReferenceType.student)
  logger.debug(`increase salty bucks value for student ${studentId} by ${fromStudent.salty_bucks_balance}`)
  await increaseSaltyBucksBalance(studentId, fromStudent.salty_bucks_balance)
}

const handleVideoEarnings = async (videoId, resourceType, studentId) => {
  if (BookContentResourceTypeEnum.video !== resourceType) {
    return
  }

  const video = await getVideo(videoId)

  const unseenVideosInChapter = await unseenVideosInChapterCount(studentId)(video)
  const completedChapters = watchedAllVideos(unseenVideosInChapter)

  if (completedChapters.length > 0) {
    await mapP(
      increaseSaltyBucksForAllVideosInChapter(studentId)
    )(completedChapters)

    const unseenVideosInBook = await unseenVideosInBookCount(studentId)(completedChapters)
    const completedBooks = watchedAllVideos(unseenVideosInBook)

    if (completedBooks.length > 0) {
      await mapP(
        increaseSaltyBucksForAllVideosInBook(studentId)
      )(completedBooks)
    }
  }
}

export const earnSaltyBucksForResource = async (student_id: string, resource, studentCourse: StudentCourse) => {
  const settingName = getSettingNameByResourceType(resource)
  const saltyBucksSetting = await findSettingByName(settingName)

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, saltyBucksSetting.value, settingName, resource.id)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
  await handleVideoEarnings(resource.external_id, resource.type, student_id)
}

export const earnSaltyBucksForSiteActivity = async (student_id: string, duration, studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype[`activeOnSite_${duration}min`]
  const saltyBucksSetting = await findSettingByName(settingName)

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, saltyBucksSetting.value, settingName, student_id, SaltyBucksReferenceType.siteActivity)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

export const earnSaltyBucksForReadingSubchapters = async (student_id: string, subchapter_ids: string[], studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype.completeBookSection
  const saltyBucksSetting = await findSettingByName(settingName)

  let totalSaltyBucks = 0

  await handleActivityStreaks(studentCourse)

  await mapP(
    async subchapterId => {
      totalSaltyBucks += parseInt(saltyBucksSetting.value, 10)

      await logIncome(student_id, saltyBucksSetting.value, settingName, subchapterId, SaltyBucksReferenceType.book)
    }
  )(subchapter_ids)

  await increaseSaltyBucksBalance(student_id, totalSaltyBucks)
}

export const earnSaltyBucksForFinishingChapter = async (student_id: string, chapter_id: string, studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype.completeChapter
  const saltyBucksSetting = await findSettingByName(settingName)

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, saltyBucksSetting.value, settingName, chapter_id, SaltyBucksReferenceType.book)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

export const earnSaltyBucksForFinishingBook = async (student_id: string, book_id: string, studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype.completeBook
  const saltyBucksSetting = await findSettingByName(settingName)

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, saltyBucksSetting.value, settingName, book_id, SaltyBucksReferenceType.book)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

export const earnSaltyBucksForFinishingCourse = async (student_id: string, course_id: string, studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype.completeCourse
  const saltyBucksSetting = await findSettingByName(settingName)

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, saltyBucksSetting.value, settingName, course_id, SaltyBucksReferenceType.course)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

export const earnSaltyBucksForContentQuestionAttempt = async (student_id: string, book_id: string, studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype.answerContentQuestion
  const saltyBucksSetting = await findSettingByName(settingName)

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, saltyBucksSetting.value, settingName, book_id, SaltyBucksReferenceType.book)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

/**
 * The value is calculated as mx+a where
 * @param m Multiplier set by admin
 * @param x Question difficulty percentage as decimal, so 70% equals to 70
 * @param a Base value for content question answer attempt, set by admin
 * @example If m = 2, x = 35%, a = 5 then salty bucks earned eqaul to 2*35+5=75
 */
export const calculateSaltyBucksForCorrectContentQuestionAnswer = (m: string, x: string, a: string) => (
  int(m) * int(x) + int(a)
)

/**
 * The value is calculated as mx where
 * @param m Multiplier set by admin
 * @param x Question difficulty percentage as decimal, so 70% equals to 70
 * @example If m = 2, x = 35% then salty bucks earned eqaul to 2*35=70
 */
export const calculateSaltyBucksForCorrectQuestionAnswer = (m: string, x: string) => (
  int(m) * int(x)
)

export const earnSaltyBucksForCorrectContentQuestionAnswer = async (student_id: string, difficulty: string, book_id: string, studentCourse?: StudentCourse) => {
  const [baseValueSetting, multiplierSetting] = await Promise.all([
    findSettingByName(SaltyBucksOperationSubtype.answerContentQuestion),
    findSettingByName(SaltyBucksOperationSubtype.multiplierAnswerContentQuestionCorrect),
  ])

  await handleActivityStreaks(studentCourse)

  const earnedSaltyBucks = calculateSaltyBucksForCorrectContentQuestionAnswer(
    multiplierSetting.value,
    difficulty,
    baseValueSetting.value
  )

  await logIncome(student_id, earnedSaltyBucks, SaltyBucksOperationSubtype.correctAnswerContentQuestion, book_id, SaltyBucksReferenceType.book)
  await increaseSaltyBucksBalance(student_id, earnedSaltyBucks)
}

const earnSaltyBucksForFinishingFullMCATExam = (student_id: string, student_exam_id: string) => async () => {
  const settingName = SaltyBucksOperationSubtype.completeFullMcat
  const saltyBucksSetting = await findSettingByName(settingName)

  await logIncome(student_id, saltyBucksSetting.value, settingName, student_exam_id, SaltyBucksReferenceType.exam)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

const earnSaltyBucksForFinishingMiniMCATExam = (student_id: string, student_exam_id: string) => async () => {
  const settingName = SaltyBucksOperationSubtype.completeChapterQuizMiniMcat
  const saltyBucksSetting = await findSettingByName(settingName)

  await logIncome(student_id, saltyBucksSetting.value, settingName, student_exam_id, SaltyBucksReferenceType.exam)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

const earnSaltyBucksForFinishingDefaultExam = (student_id: string, student_exam_id: string) => async () => {
  const settingName = SaltyBucksOperationSubtype.completeDefaultExam
  const saltyBucksSetting = await findSettingByName(settingName)

  await logIncome(student_id, saltyBucksSetting.value, settingName, student_exam_id, SaltyBucksReferenceType.exam)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

export const earnSaltyBucksForFinishingExam = async (student_id: string, student_exam_id: string, exam_type: string, studentCourse?: StudentCourse) => {
  await handleActivityStreaks(studentCourse)

  return R.cond([
    [R.equals('full'), earnSaltyBucksForFinishingFullMCATExam(student_id, student_exam_id)],
    [R.equals('mini'), earnSaltyBucksForFinishingMiniMCATExam(student_id, student_exam_id)],
    [R.T, earnSaltyBucksForFinishingDefaultExam(student_id, student_exam_id)],
  ])(exam_type)
}

const earnSaltyBucksForExamQuestionAnswerAttempt = async (settingName: SaltyBucksOperationSubtype, student_id: string, student_exam_id: string) => {
  const saltyBucksSetting = await findSettingByName(settingName)

  await logIncome(student_id, saltyBucksSetting.value, settingName, student_exam_id, SaltyBucksReferenceType.exam)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

const earnSaltyBucksForCorrectExamQuestionAnswer = async (
  settingName: SaltyBucksOperationSubtype,
  multiplierSettingName: SaltyBucksOperationSubtype,
  difficulty,
  student_id: string,
  student_exam_id: string
) => {
  const multiplierSetting = await findSettingByName(multiplierSettingName)

  const earnedSaltyBucks = calculateSaltyBucksForCorrectQuestionAnswer(
    multiplierSetting.value,
    difficulty
  )

  await logIncome(student_id, earnedSaltyBucks, settingName, student_exam_id, SaltyBucksReferenceType.exam)
  await increaseSaltyBucksBalance(student_id, earnedSaltyBucks)
}

const getDifficultyFromQuestion = R.path(['originalQuestion', 'difficulty_percentage'])

const earnSaltyBucksForAnswereringQuestion = async (
  student_id: string,
  student_exam_id: string,
  is_correct: boolean,
  question,
  answerType: SaltyBucksOperationSubtype,
  multiplierType: SaltyBucksOperationSubtype
) => (
  is_correct
    ? earnSaltyBucksForCorrectExamQuestionAnswer(
      answerType,
      multiplierType,
      getDifficultyFromQuestion(question),
      student_id,
      student_exam_id
    )
    : earnSaltyBucksForExamQuestionAnswerAttempt(
      answerType,
      student_id,
      student_exam_id
    )
)

const earnSaltyBucksForQuestionAnswerFullMCATExam = (student_id: string, student_exam_id: string, is_correct: boolean, question) => async () => (
  earnSaltyBucksForAnswereringQuestion(
    student_id,
    student_exam_id,
    is_correct,
    question,
    SaltyBucksOperationSubtype.answerQuestionFullMcat,
    SaltyBucksOperationSubtype.multiplierTestQuestionFullMcat
  )
)

const earnSaltyBucksForQuestionAnswerMiniMCATExam = (student_id: string, student_exam_id: string, is_correct: boolean, question) => async () => (
  earnSaltyBucksForAnswereringQuestion(
    student_id,
    student_exam_id,
    is_correct,
    question,
    SaltyBucksOperationSubtype.answerChapterQuizQuestionMiniMcat,
    SaltyBucksOperationSubtype.multiplierChapterQuizQuestionMiniMcat
  )
)

const earnSaltyBucksForQuestionAnswerDefaultExam = (student_id: string, student_exam_id: string, is_correct: boolean, question) => async () => (
  earnSaltyBucksForAnswereringQuestion(
    student_id,
    student_exam_id,
    is_correct,
    question,
    SaltyBucksOperationSubtype.answerQuestionDefaultExam,
    SaltyBucksOperationSubtype.multiplierTestQuestionDefaultExam
  )
)

export const earnSaltyBucksForQuestionAnswer = async (student_id: string, student_exam_id: string, exam_type: string, is_correct: boolean, question, studentCourse?: StudentCourse) => {
  await handleActivityStreaks(studentCourse)

  return R.cond([
    [R.equals('full'), earnSaltyBucksForQuestionAnswerFullMCATExam(student_id, student_exam_id, is_correct, question)],
    [R.equals('mini'), earnSaltyBucksForQuestionAnswerMiniMCATExam(student_id, student_exam_id, is_correct, question)],
    [R.T, earnSaltyBucksForQuestionAnswerDefaultExam(student_id, student_exam_id, is_correct, question)],
  ])(exam_type)
}

const earnSaltyBucksForCoursePurchase = async (student_id: string, book_course_id: string) => {
  const settingName = SaltyBucksOperationSubtype.purchaseCourse
  const saltyBucksSetting = await findSettingByName(settingName)

  await logIncome(student_id, saltyBucksSetting.value, settingName, book_course_id, SaltyBucksReferenceType.course)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

/**
 * Issue Salty Bucks for all bought courses, even free trial,
 * as students won't get more for upgrading the course.
 *
 * We need to handle all courses one by one for the student's balance
 * to be updated correctly, hence this construction
 */
export const issueSaltyBucksForCourses = async (studentId, courses) => {
  const coursesFiltered = R.filter(R.identity)(courses)

  for await (const course of coursesFiltered) {
    await earnSaltyBucksForCoursePurchase(studentId, course.id)
  }
}

export const earnSaltyBucksForFlashcardAnswer = async (student_id: string, flashcard_id: string, isCorrect: boolean, studentCourse?: StudentCourse) => {
  const settingName = isCorrect ? SaltyBucksOperationSubtype.flashcardIncreasePLevel : SaltyBucksOperationSubtype.flashcardResetPLevel
  const saltyBucksSetting = await findSettingByName(settingName)

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, saltyBucksSetting.value, settingName, flashcard_id, SaltyBucksReferenceType.flashcard)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

export const validateStudentHasEnoughSaltyBucks = async (student, settingName: string) => {
  const saltyBucksSetting = await findSettingByName(settingName)

  R.when(
    R.propSatisfies(
      R.lt(student.salty_bucks_balance),
      'value'
    ),
    () => throwException(insufficientFundsException())
  )(saltyBucksSetting)
}

export const deductSaltyBucksForContenQuestionReset = async (student_id: string, question_id: string, trx?) => {
  const settingName = SaltyBucksOperationSubtype.resetSingleContentQuestion
  const student = await findStudent({ id: student_id })
  const saltyBucksSetting = await findSettingByName(settingName)

  R.when(
    R.propSatisfies(
      R.lt(student.salty_bucks_balance),
      'value'
    ),
    () => throwException(insufficientFundsException())
  )(saltyBucksSetting)

  await logOutcome(student_id, saltyBucksSetting.value, settingName, question_id, SaltyBucksReferenceType.contentQuestion)
  await decreaseSaltyBucksBalance(student_id, saltyBucksSetting.value, trx)
}

export const deductSaltyBucksForChapterContenQuestionReset = async (student_id: string, chapter_id: string, cost, trx?) => {
  await logOutcome(
    student_id,
    cost,
    SaltyBucksOperationSubtype.resetChapterContentQuestions,
    chapter_id, SaltyBucksReferenceType.contentQuestion
  )

  await decreaseSaltyBucksBalance(student_id, cost, trx)
}

export const earnSaltyBucksForVelocityStreak = async (student_id: string, course_id: string) => {
  const settingName = SaltyBucksOperationSubtype.dashboardVelocity_3DaysGreen
  const saltyBucksSetting = await findSettingByName(settingName)

  await logIncome(student_id, saltyBucksSetting.value, settingName, course_id, SaltyBucksReferenceType.course)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

export const earnSaltyBucksForEndingAminoAcidGame = async (student_id: string, amino_acid_game_id: string, salty_bucks_sum: number, studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype.endAminoAcidGame

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, salty_bucks_sum, settingName, amino_acid_game_id, SaltyBucksReferenceType.aminoAcidGame)
  await increaseSaltyBucksBalance(student_id, salty_bucks_sum)
}

export const earnSaltyBucksForEndingRespirationGame = async (student_id: string, respiration_game_id: string, salty_bucks_sum: number, studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype.endRespirationGame

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, salty_bucks_sum, settingName, respiration_game_id, SaltyBucksReferenceType.respirationGame)
  await increaseSaltyBucksBalance(student_id, salty_bucks_sum)
}

export const earnSaltyBucksForEndingHangmanGame = async (student_id: string, hangman_game_id: string, salty_bucks_sum: number, studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype.endHangmanGame

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, salty_bucks_sum, settingName, hangman_game_id, SaltyBucksReferenceType.hangmanGame)
  await increaseSaltyBucksBalance(student_id, salty_bucks_sum)
}

export const earnSaltyBucksForRegisteringAtGladiators = async (student_id: string, user_id: string, userRole: UserRoleEnum) => {
  let settingName
  switch (userRole) {
    case UserRoleEnum.patrician:
      settingName = SaltyBucksOperationSubtype.registerAsPatrician
      break
    case UserRoleEnum.plebeian:
      settingName = SaltyBucksOperationSubtype.registerAsPlebeian
      break
    case UserRoleEnum.libertus:
      settingName = SaltyBucksOperationSubtype.registerAsLibertus
      break
  }
  const saltyBucksSetting = await findSettingByName(settingName)

  await logIncome(student_id, saltyBucksSetting.value, settingName, user_id, SaltyBucksReferenceType.gladiatorsGame)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

export const earnSaltyBucksForRegisteringAsPatrician = async (student_id: string, user_id: string) => (
  earnSaltyBucksForRegisteringAtGladiators(student_id, user_id, UserRoleEnum.patrician)
)

export const earnSaltyBucksForRegisteringAsPlebeian = async (student_id: string, user_id: string) => (
  earnSaltyBucksForRegisteringAtGladiators(student_id, user_id, UserRoleEnum.plebeian)
)

export const earnSaltyBucksForRegisteringAsLibertus = async (student_id: string, user_id: string) => (
  earnSaltyBucksForRegisteringAtGladiators(student_id, user_id, UserRoleEnum.libertus)
)

export const deductSaltyBucksForGladiatorPurchase = async (student_id: string, gladiator_id: string, cost: number) => {
  await logOutcome(
    student_id,
    cost,
    SaltyBucksOperationSubtype.gladiatorsPurchaseGladiator,
    gladiator_id, SaltyBucksReferenceType.gladiatorsGame
  )

  await decreaseSaltyBucksBalance(student_id, cost)
}

export const earnSaltyBucksForGladiatorsGame = async (student_id: string, operation_subtype: SaltyBucksOperationSubtype, amount: number) => {
  await logIncome(
    student_id,
    amount,
    operation_subtype,
    student_id,
    SaltyBucksReferenceType.gladiatorsGame
  )

  await increaseSaltyBucksBalance(student_id, amount)
}

export const deductSaltyBucksForGladiatorsGame = async (student_id: string, operation_subtype: SaltyBucksOperationSubtype, amount: number) => {
  await logOutcome(
    student_id,
    amount,
    operation_subtype,
    student_id,
    SaltyBucksReferenceType.gladiatorsGame
  )

  await decreaseSaltyBucksBalance(student_id, amount)
}

export const earnSaltyBucksForAiTutorQuestionAnswer = async (student_id: string, amount: number) => {
  await logIncome(
    student_id,
    amount,
    SaltyBucksOperationSubtype.aiTutorQuestionAnswer,
    student_id,
    SaltyBucksReferenceType.aiTutor
  )

  await increaseSaltyBucksBalance(student_id, amount)
}

export const deductSaltyBucksForAiTutorQuestionAnswer = async (student_id: string, amount: number) => {
  await logOutcome(
    student_id,
    amount,
    SaltyBucksOperationSubtype.aiTutorQuestionAnswer,
    student_id,
    SaltyBucksReferenceType.aiTutor
  )

  await decreaseSaltyBucksBalance(student_id, amount)
}

export const deductSaltyBucksForAiTutorMessage = async (student_id: string) => {
  const saltyBucksSetting = await findSettingByName('ai_chat_prompt_cost')
  const student = await findStudent({ id: student_id })
  const amount = Math.min(int(saltyBucksSetting.value), int(student.salty_bucks_balance))

  await logOutcome(
    student_id,
    amount,
    SaltyBucksOperationSubtype.aiTutorMessage,
    student_id,
    SaltyBucksReferenceType.aiTutor
  )

  await decreaseSaltyBucksBalance(student_id, amount)
}

export const earnSaltyBucksForRatingVideo = async (student_id: string, video_id: string, studentCourse?: StudentCourse) => {
  const settingName = SaltyBucksOperationSubtype.ratingVideo
  const saltyBucksSetting = await findSettingByName(settingName)

  await handleActivityStreaks(studentCourse)

  await logIncome(student_id, saltyBucksSetting.value, settingName, video_id, SaltyBucksReferenceType.resource)
  await increaseSaltyBucksBalance(student_id, saltyBucksSetting.value)
}

export const moveSaltyBucksFromWallet = async (student_id: string) => {
  const student = await findStudent({ id: student_id })

  if (student.wallet_balance > 0) {
    await logIncome(student_id, student.wallet_balance, SaltyBucksOperationSubtype.cashOutWallet, student.id)
    await increaseSaltyBucksBalance(student_id, student.wallet_balance)
  }

  await resetWalletBalance(student_id)
}
