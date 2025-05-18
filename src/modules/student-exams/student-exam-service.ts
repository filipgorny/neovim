import * as R from 'ramda'
import {
  countCompletedExams,
  create,
  patch,
  findExamsForInitialPTSCalculation,
  fetchStudentExamsWithIds,
  dropExamsWithIds,
  expireExam,
  findOne as findExam,
  resetForRetake
} from './student-exam-repository'
import { makeDTO } from './dto/student-exam-dto'
import { ExamStateDTO } from './dto/exam-state-dto'
import {
  STUDENT_EXAM_STATUS_ARCHIVED,
  STUDENT_EXAM_STATUS_COMPLETED,
  STUDENT_EXAM_STATUS_EXPIRED,
  STUDENT_EXAM_STATUS_IN_PROGRESS
} from './student-exam-statuses'
import { StartExamPayloadDto } from './dto/start-exam-payload-dto'
import { calculateSectionPTS } from './utils/calculate-section-pts'
import { extractPropAndFlattenArray } from './actions/helpers/helpers'
import { dropQuestionsWithIds } from '../student-exam-questions/student-exam-question-repository'
import { dropPassagesWithIds } from '../student-exam-passages/student-exam-passage-repository'
import { dropSectionsWithIds } from '../student-exam-sections/student-exam-section-repository'
import { deleteStudentExamLogs, logAccessPeriodUpdated, logExamExpired } from '../student-exam-logs/student-exam-logs-service'
import { examAccessPeriodChanged } from '../../../services/notification/notification-dispatcher'
import { findOne as findExamType } from '../../../src/modules/exam-types/exam-type-repository'
import { getMinMaxScoresFromType } from '../../../services/student-exam-scores/get-min-max-sxores'
import { find as findAttachedExams } from '../student-attached-exams/student-attached-exam-repository'
import moment from 'moment'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { deleteAttachedExamsByIds, deleteAttachedExamsByStudentExamId } from '../student-attached-exams/student-attached-exam-service'
import mapP from '../../../utils/function/mapp'
import { addExam, syncExam } from '../exams/exam-service'
import { ProductTypeEnum } from '../students/product-types'
import { patch as patchStudent } from '../students/student-repository'
import { findExamByExternalId } from '../exams/exam-repository'
import { DATETIME_COURSE_FORMAT } from '../../constants'
import { customException, throwException } from '../../../utils/error/error-factory'
import { Payload as PurchaseExamPayload } from './actions/purchase-exam'
import { flattenQuestions } from '../../../services/student-exams/flatten-questions'
import { removeQuestionsByIds, resetQuestion } from '../student-exam-questions/student-exam-question-service'
import { removePassagesByIds } from '../student-exam-passages/student-exam-passage-service'
import logger from '../../../services/logger/logger'
import forEachP from '../../../utils/function/foreachp'
import { resetSection } from '../student-exam-sections/student-exam-section-service'

export const createStudentExam = (externalCreatedAt, isFreeTrial, exam_retakes_enabled: boolean, max_exam_completions: number, free_trial_featured_exam: boolean) => async data => {
  logger.info('createStudentExam', { externalCreatedAt, isFreeTrial, data })

  return create(makeDTO(
    data.layout_id,
    data.student_id,
    data.exam_id,
    data.external_id,
    data.title,
    data.access_period,
    data.exam_length,
    data.break_definition,
    data.exam_type_id,
    externalCreatedAt,
    data.revision,
    isFreeTrial,
    data.periodic_table_enabled,
    exam_retakes_enabled ? Math.min(data.max_completions, max_exam_completions) : 1,
    free_trial_featured_exam
  ))
}

export const dropStudentExams = async ids => {
  const exams = await fetchStudentExamsWithIds(ids)
  const sections = extractPropAndFlattenArray('sections')(exams)
  const passages = extractPropAndFlattenArray('passages')(sections)
  const questions = extractPropAndFlattenArray('questions')(passages)

  await mapP(deleteStudentExamLogs)(ids)
  await mapP(deleteAttachedExamsByStudentExamId)(ids)
  await dropQuestionsWithIds(R.pluck('id')(questions))
  await dropPassagesWithIds(R.pluck('id')(passages))
  await dropSectionsWithIds(R.pluck('id')(sections))
  await dropExamsWithIds(R.pluck('id')(exams))
}

export const archiveStudentExams = async ids => {
  const exams = await fetchStudentExamsWithIds(ids)
  const sections = extractPropAndFlattenArray('sections')(exams)
  const passages = extractPropAndFlattenArray('passages')(sections)
  const questions = extractPropAndFlattenArray('questions')(passages)

  await forEachP(deleteStudentExamLogs)(ids)
  await forEachP(deleteAttachedExamsByStudentExamId)(ids)
  await dropQuestionsWithIds(R.pluck('id')(questions))
  await dropPassagesWithIds(R.pluck('id')(passages))
  await dropSectionsWithIds(R.pluck('id')(sections))

  await forEachP(
    async id => patch(id, {
      status: STUDENT_EXAM_STATUS_ARCHIVED,
    })
  )(ids)

  // todo mark exam as archived
  // await dropExamsWithIds(R.pluck('id')(exams))
}

export const saveExamState = async (id: string, data: ExamStateDTO) => (
  patch(id, data)
)

export const updateExamSecondsLeft = async (id: string, data) => (
  patch(id, data)
)

export const startExam = async (id: string, accessible_to, dto: StartExamPayloadDto) => (
  patch(id, {
    accessible_from: new Date(),
    status: STUDENT_EXAM_STATUS_IN_PROGRESS,
    accessible_to,
    time_option: dto.time_option, // todo if time option != 1.0 -> exam not intact
  })
)

export const resumeExam = async (id: string) => (
  patch(id, {
    status: STUDENT_EXAM_STATUS_IN_PROGRESS,
  })
)

export const expireStudentExam = (adminId: string) => async exam => {
  await logExamExpired(exam.id, adminId, exam.status)

  return expireExam(exam.id)
}

export const finishExam = async (id: string, student_id: string, examTypeId: string, scores: object, scoresStatus: string, completionsDone: number) => {
  const completedExams = await countCompletedExams(student_id, examTypeId)

  return patch(id, {
    completed_at: new Date(),
    status: STUDENT_EXAM_STATUS_COMPLETED,
    completed_as: Number(completedExams) + 1,
    scores: JSON.stringify(scores),
    scores_status: scoresStatus,
    completions_done: completionsDone + 1,
  })
}

export const saveTimers = async (id: string, timers, timer_checkboxes) => (
  patch(id, {
    timers,
    timer_checkboxes,
  })
)

export const resetCompletedAt = async (id: string) => (
  patch(id, {
    completed_at: null,
  })
)

export const resetCurrentPage = async (id: string) => (
  patch(id, {
    current_page: null,
  })
)

export const updateTimers = async (id: string, timers: {}) => (
  patch(id, {
    timers,
  })
)

export const setPTSExclusion = async (id: string, isExcluded: boolean) => (
  patch(id, {
    is_excluded_from_pts: isExcluded,
  })
)

const extractAndOrderScores = type => sections => {
  const list = []
  const sectionLength = R.pipe(
    R.map(R.prop('length')),
    R.apply(Math.max)
  )(sections)

  for (let i = 0; i < sectionLength; i++) {
    const sectionMinMaxScore = getMinMaxScoresFromType(type, i + 1)

    list.push(calculateSectionPTS(i, sectionMinMaxScore.max)(sections))
  }

  return list
}

export const calculatePTS = async (examNumber, examTypeId) => {
  const exam = await findExamsForInitialPTSCalculation(examNumber, examTypeId)
  const type = await findExamType({ id: examTypeId }, ['scaledScoreDefinitions.template.scores'])

  return R.pipe(
    R.pluck('scores'),
    R.map(
      R.pipe(
        JSON.parse,
        R.path(['sections'])
      )
    ),
    extractAndOrderScores(type)
  )(exam)
}

export const setAccessibleTo = async (exam, accessible_to, admin_id, student) => {
  const { id, title } = exam
  const entity = await patch(id, {
    status: exam.status,
    accessible_to,
  })

  await logAccessPeriodUpdated(id, admin_id, accessible_to)
  await examAccessPeriodChanged({
    email: student.email,
    examTitle: title,
    expiresAt: moment(accessible_to).format('MM/DD/YYYY hh:mm A'),
  })

  return entity
}

export const isExpired = R.propEq('status', STUDENT_EXAM_STATUS_EXPIRED)

export const deleteStudentExamsByCourseId = async (studentCourseId: string, trx) => {
  const attachedExams = await R.pipeWith(R.andThen)([
    async id => findAttachedExams({ limit: { page: 1, take: 100 }, order: { by: 'type', dir: 'asc' } }, {
      course_id: id,
    }),
    R.prop('data'),
    collectionToJson,
  ])(studentCourseId)

  await deleteAttachedExamsByIds(R.pluck('id')(attachedExams))
  await dropStudentExams(R.pluck('exam_id')(attachedExams))

  return true
}

export const purchaseExam = async (student, payload: PurchaseExamPayload) => {
  logger.info('purchaseExam:', { student, payload })
  if (!moment(payload.external_created_at, DATETIME_COURSE_FORMAT).isValid()) {
    logger.fatal('purchaseExam: failed due to invalid external_created_at', { student, payload })
    throwException(customException('student-exams.invalid-creation-date', 422, `External creation date must be in format '${DATETIME_COURSE_FORMAT}'`))
  }

  const result = await addExam(student.id, student.email, payload)

  logger.info('purchaseExam: updating student has_exams')
  await patchStudent(student.id, { has_exams: true })

  logger.info('purchaseExam: success', { student, payload, result })
  return result
}

export const removeStudentExam = async (id: string) => (
  archiveStudentExams([id])
)

export const updateMaxCompletions = async (id: string, max_completions: number) => (
  patch(id, { max_completions })
)

export const resetExamForRetake = async (examId) => {
  await resetForRetake(examId)

  const exam = await findExam({ id: examId }, ['sections.passages.questions'])

  const sections = R.prop('sections')(exam)

  await mapP(
    async section => resetSection(section.id)
  )(sections)

  const questions = R.pipe(
    flattenQuestions,
    R.map(R.prop('questions')),
    R.flatten
  )(exam)

  await mapP(
    async question => resetQuestion(question.id)
  )(questions)
}
