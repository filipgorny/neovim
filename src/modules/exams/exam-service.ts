import R from 'ramda'
import moment from 'moment'
import renameProps from '../../../utils/object/rename-props'
import randomString from '../../../utils/string/random-string'
import { create, patch, findExamForSync, findOneOrFail, findOneOrFailWithDeleted } from './exam-repository'
import { findOneOrFail as findExamType } from '../exam-types/exam-type-repository'
import { makeDTO } from './dto/exam-dto'
import { calculatePTS, createStudentExam } from '../student-exams/student-exam-service'
import { Payload as PurchaseExamPayload } from '../student-exams/actions/purchase-exam'
import { cretateExamSectionsFromOriginalSections } from '../student-exam-sections/student-exam-section-service'
import { fetchExistingExamsCount, patchWhereExternalIdAndExternalCreatedAt, findOneOrFail as findStudentExam } from '../student-exams/student-exam-repository'
import { createNewStudentExamScore, fetchStudentExamScores } from '../student-exam-scores/student-exam-scores-repository'
import {
  logExamCreated,
  logExternalIdUpdated,
  logAccessPeriodUpdated,
  logExamDeleted,
  logTitleUpdated
} from '../exam-logs/exam-logs-service'
import { getMaxScoresFromType } from '../../../services/student-exam-scores/get-min-max-sxores'
import { removeExam } from '../attached-exams/attached-exam-repository'
import { DATE_FORMAT_YMD, PREVIEW_STUDENT_EMAIL } from '../../constants'
import { createStudentAttachedExamRecord } from '../student-attached-exams/student-attached-exam-service'
import { ScoreCalculationMethod } from './score-calculation-methods'
import { initializeStats } from '../exam-score-stats/exam-score-stats-service'
import { findByExamId as findExamScoreMapByExamId } from '../exam-score-map/exam-score-map-repository'
import { ExamScoreDiagram } from './exam-score-diagram'
import { customException, throwException } from '@desmart/js-utils'
import logger from '../../../services/logger/logger'
import { StudentCourse } from '../../types/student-course'

export const createExam = async (
  layout_id: string,
  title: string,
  file_name: string,
  uploaded_by: string,
  external_id: string,
  access_period: number,
  exam_length: object,
  exam_type_id: string,
  google_form_url: string,
  score_calculation_method: ScoreCalculationMethod,
  max_completions: number,
  periodic_table_enabled?: boolean,
  custom_title?: string
) => {
  const exam = await create(
    makeDTO(layout_id, title, file_name, uploaded_by, external_id, access_period, exam_length, exam_type_id, google_form_url, score_calculation_method, max_completions, periodic_table_enabled, custom_title)
  )

  await logExamCreated(exam.id, uploaded_by)

  return exam
}

export const setExternalId = (id: string) => async (external_id: string, user_id: string) => {
  const exam = await patch(id, { external_id })

  await logExternalIdUpdated(id, user_id, external_id)

  return exam
}

export const setAccessPeriod = (id: string) => async (access_period: number, user_id: string) => {
  const exam = await patch(id, { access_period })

  await logAccessPeriodUpdated(id, user_id, access_period)

  return exam
}

export const setTitle = (id: string) => async (title: string, user_id: string) => {
  const exam = await patch(id, { title })

  await logTitleUpdated(id, user_id, title)

  return exam
}

export const setGoogleFormUrl = (id: string) => async (google_form_url: string) => (
  patch(id, { google_form_url })
)

export const setPeriodicTableFlag = async (id: string, periodic_table_enabled: boolean) => (
  patch(id, { periodic_table_enabled })
)

export const setReviewVideoId = async (id: string, review_video_id: string | null) => (
  patch(id, { review_video_id })
)

export const setCustomTitle = async (id: string, custom_title: string | null) => (
  patch(id, { custom_title })
)

export const setMaxCompletions = async (id: string, max_completions: number) => (
  patch(id, { max_completions })
)

export const deleteExam = async (id: string, title: string, externalId: string, user_id: string) => {
  const exam = await patch(id, {
    deleted_at: new Date(),
    title: `${title}-deleted-${randomString()}`,
    external_id: `${externalId}-deleted-${randomString()}`,
  })

  await logExamDeleted(id, user_id)
  await removeExam(exam.id)

  return exam
}

const prepareExamEntity = (studentId: string, examType: { break_definition: string }) => async originalExam => (
  R.pipe(
    R.pick(['id', 'layout_id', 'title', 'external_id', 'access_period', 'exam_length', 'exam_type_id', 'uploaded_at', 'periodic_table_enabled', 'max_completions']),
    renameProps({
      id: 'exam_id',
      uploaded_at: 'revision',
    }),
    R.mergeRight({
      student_id: studentId,
      break_definition: examType.break_definition,
    })
  )(originalExam)
)

const prepareSectionEntities = async sections => (
  R.map(
    R.pick(['title', 'order', 'passages', 'full_title'])
  )(sections)
)

const choosePtsArray = (defaultArray, array) => R.when(
  R.isEmpty,
  R.always(defaultArray)
)(array)

export const createFullExam = (studentId, courseId, externalCreatedAt, isFreeTrial = false, exam_retakes_enabled = true, max_exam_completions = 1) => async (originalExam) => {
  logger.info(`createFullExam: Creating full exam for student ${studentId} and course ${courseId}`, { studentId, courseId, externalCreatedAt, isFreeTrial, exam_retakes_enabled })
  const originalSections = R.prop('sections')(originalExam)
  const examType = await findExamType({ id: originalExam.exam_type_id }, ['scaledScoreDefinitions.template.scores'])
  const studentExamScores = await fetchStudentExamScores(studentId, examType.id)

  if (!studentExamScores) {
    logger.info(`createFullExam: Creating new student exam score for student ${studentId} and exam type ${examType.id}`)
    const ptsArray = await calculatePTS(1, examType.id)
    const defaultPtsArray = getMaxScoresFromType(examType)
    await createNewStudentExamScore(examType.id, studentId, choosePtsArray(defaultPtsArray, ptsArray))
      .catch(() => {})
  }

  logger.info('createFullExam: Creating exam entity')

  const exam = await R.pipeWith(R.andThen)([
    prepareExamEntity(studentId, examType),
    createStudentExam(externalCreatedAt, isFreeTrial, exam_retakes_enabled, max_exam_completions, originalExam.attached_exam?.free_trial_featured_exam),
  ])(originalExam)

  logger.info(`createFullExam: Created exam ${exam.id} for student ${studentId} and course ${courseId}`)

  logger.info('createFullExam: Creating exam sections')
  await R.pipeWith(R.andThen)([
    prepareSectionEntities,
    cretateExamSectionsFromOriginalSections(exam.id),
  ])(originalSections)

  logger.info('createFullExam: Created exam sections')

  if (courseId && originalExam.attached_exam) {
    logger.info('createFullExam: Creating student attached exam record')
    const attachedType = R.pathOr('', ['attached_exam', 'type'])(originalExam)
    const attachedId = R.pathOr('', ['attached_exam', 'id'])(originalExam)

    await createStudentAttachedExamRecord(courseId, attachedId, attachedType, exam.id)
  }

  logger.info('createFullExam: Returning original exam')

  return originalExam
}

export const createStudentExamFromFacade = async (studentExamId: string, studentCourse: StudentCourse) => {
  const studentExam = await findStudentExam({ id: studentExamId }, ['originalExam.sections.passages.questions'])

  const originalSections = R.prop('sections')(studentExam.originalExam)

  logger.info('createStudentExamFromFacade: Creating exam sections')
  await R.pipeWith(R.andThen)([
    prepareSectionEntities,
    cretateExamSectionsFromOriginalSections(studentExam.id),
  ])(originalSections)

  logger.info('createStudentExamFromFacade: Created exam sections')

  // if (studentCourse.id && studentExam.originalExam.attached_exam) {
  //   logger.info('createStudentExamFromFacade: Creating student attached exam record')
  //   const attachedType = R.pathOr('', ['attached_exam', 'type'])(studentExam.originalExam)
  //   const attachedId = R.pathOr('', ['attached_exam', 'id'])(studentExam.originalExam)

  //   await createStudentAttachedExamRecord(studentCourse.id, attachedId, attachedType, studentExam.id)
  // }

  logger.info('createStudentExamFromFacade: Returning original exam')

  return studentExam
}

export const createExamFacade = (studentId, courseId, externalCreatedAt, isFreeTrial = false, exam_retakes_enabled = true, max_exam_completions = 1) => async (originalExam) => {
  logger.info(`createExamFacade: Creating minimal exam for student ${studentId} and course ${courseId} (without exam contents)`, { studentId, courseId, externalCreatedAt, isFreeTrial, exam_retakes_enabled })

  const originalSections = R.prop('sections')(originalExam)
  const examType = await findExamType({ id: originalExam.exam_type_id }, ['scaledScoreDefinitions.template.scores'])
  const studentExamScores = await fetchStudentExamScores(studentId, examType.id)

  if (!studentExamScores) {
    logger.info(`createExamFacade: Creating new student exam score for student ${studentId} and exam type ${examType.id}`)

    const ptsArray = await calculatePTS(1, examType.id)
    const defaultPtsArray = getMaxScoresFromType(examType)
    await createNewStudentExamScore(examType.id, studentId, choosePtsArray(defaultPtsArray, ptsArray))
      .catch(() => {})
  }

  logger.info('createExamFacade: Creating exam entity')

  const exam = await R.pipeWith(R.andThen)([
    prepareExamEntity(studentId, examType),
    createStudentExam(externalCreatedAt, isFreeTrial, exam_retakes_enabled, max_exam_completions, originalExam.attached_exam?.free_trial_featured_exam),
  ])(originalExam)

  logger.info(`createExamFacade: Created exam ${exam.id} for student ${studentId} and course ${courseId}`)

  if (courseId && originalExam.attached_exam) {
    logger.info('createStudentExamFromFacade: Creating student attached exam record')
    const attachedType = R.pathOr('', ['attached_exam', 'type'])(originalExam)
    const attachedId = R.pathOr('', ['attached_exam', 'id'])(originalExam)

    await createStudentAttachedExamRecord(courseId, attachedId, attachedType, exam.id)
  }

  return originalExam
}

export const syncExam = (studentId: string, email: string) => async product => {
  const originalExam = await findExamForSync(product.id)
  const externalCreatedAt = moment(product.created_at).format(DATE_FORMAT_YMD)

  // skip exam not found in DB
  if (!originalExam) {
    console.log('Original exam not found')

    return
  }

  const existingExamsCount = await fetchExistingExamsCount(externalCreatedAt, product.id, studentId)

  // skip exam already attached to student
  if (existingExamsCount > 0 && email !== PREVIEW_STUDENT_EMAIL) {
    console.log('Exam already attached to student')

    return existingExamsCount
  }

  if (email === PREVIEW_STUDENT_EMAIL) {
    await patchWhereExternalIdAndExternalCreatedAt(externalCreatedAt, product.id, studentId)({
      deleted_at: new Date(),
    })
  }

  return createFullExam(studentId, null, product.created_at)(originalExam)
}

export const addExam = async (studentId: string, email: string, payload: PurchaseExamPayload) => {
  logger.info('addExam:', { studentId, email, payload })
  const originalExam = await findExamForSync(payload.external_id)
  const externalCreatedAt = moment(payload.external_created_at).format(DATE_FORMAT_YMD)

  if (!originalExam) {
    logger.fatal('addExam: Original exam not found', { payload })
    throwException(customException('exams.not-found', 404, 'Original exam not found'))
  }

  if (email === PREVIEW_STUDENT_EMAIL) {
    logger.info('addExam: We are using preview student, so we will delete exam')
    await patchWhereExternalIdAndExternalCreatedAt(externalCreatedAt, payload.external_id, studentId)({
      deleted_at: new Date(),
    })
  }

  return createFullExam(studentId, null, payload.external_created_at)(originalExam)
}

export const setScoreCalculationMethod = async (id: string, method: ScoreCalculationMethod) => (
  patch(id, {
    score_calculation_method: method,
  })
)

export const getMinScoreAndMaxScore = async (id: string) => {
  const exam = await findOneOrFailWithDeleted({ id }, ['sections'])

  const minScore = R.pipe(
    R.pluck('score_min'),
    R.sum
  )(exam.sections)
  const maxScore = R.pipe(
    R.pluck('score_max'),
    R.sum
  )(exam.sections)

  return { minScore, maxScore }
}

export const initializeExamScoreStats = async (id: string) => {
  const { minScore, maxScore } = await getMinScoreAndMaxScore(id)

  return initializeStats(id, minScore, maxScore)
}

export const getStudentExamsStatsData = async (id: string, calcPercentileRanks: boolean) => {
  const { minScore, maxScore } = await getMinScoreAndMaxScore(id)
  const examScoreMapElements = await findExamScoreMapByExamId(id)

  const studentAmounts = R.pluck('student_amount')(examScoreMapElements)
  const percentileRanks = R.pipe(
    R.pluck('percentile_rank'),
    R.map(n => +n)
  )(examScoreMapElements)

  if (calcPercentileRanks) {
    return new ExamScoreDiagram(minScore, maxScore, studentAmounts).getDataForGraphs()
  } else {
    return new ExamScoreDiagram(minScore, maxScore, studentAmounts, percentileRanks).getDataForGraphs()
  }
}
