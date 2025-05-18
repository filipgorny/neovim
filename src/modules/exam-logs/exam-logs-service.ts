import { create } from './exam-logs-repository'
import { makeDTO } from './dto/exam-log-dto'
import {
  EXAM_LOG_CREATED,
  EXAM_LOG_EXTERNAL_ID_UPDATED,
  EXAM_LOG_ACCESS_PERIOD_UPDATED,
  EXAM_LOG_DELETED,
  EXAM_LOG_SCALED_SCORES_UPDATED,
  EXAM_LOG_REUPLOADED,
  EXAM_LOG_TITLE_UPDATED,
  EXAM_LOG_SCORE_CALCULATION_METHOD_CHANGED
} from './exam-log-types'

export const logExamCreated = async (
  exam_id: string,
  admin_id: string
) => (
  create(
    makeDTO(exam_id, admin_id, EXAM_LOG_CREATED)
  )
)

export const logExternalIdUpdated = async (
  exam_id: string,
  admin_id: string,
  external_id: string
) => (
  create(
    makeDTO(exam_id, admin_id, EXAM_LOG_EXTERNAL_ID_UPDATED, external_id)
  )
)

export const logAccessPeriodUpdated = async (
  exam_id: string,
  admin_id: string,
  access_period
) => (
  create(
    makeDTO(exam_id, admin_id, EXAM_LOG_ACCESS_PERIOD_UPDATED, access_period)
  )
)

export const logTitleUpdated = async (
  exam_id: string,
  admin_id: string,
  title
) => (
  create(
    makeDTO(exam_id, admin_id, EXAM_LOG_TITLE_UPDATED, title)
  )
)

export const logScaledScoresUpdated = async (
  exam_id: string,
  admin_id: string,
  scaled_scores
) => (
  create(
    makeDTO(exam_id, admin_id, EXAM_LOG_SCALED_SCORES_UPDATED, scaled_scores)
  )
)

export const logExamReuploaded = async (
  exam_id: string,
  admin_id: string,
  trx?
) => (
  create(
    makeDTO(exam_id, admin_id, EXAM_LOG_REUPLOADED), trx
  )
)

export const logExamDeleted = async (
  exam_id: string,
  admin_id: string
) => (
  create(
    makeDTO(exam_id, admin_id, EXAM_LOG_DELETED)
  )
)

export const logScoreCalculationMethodChanged = async (
  exam_id: string,
  admin_id: string,
  method: string
) => (
  create(
    makeDTO(exam_id, admin_id, EXAM_LOG_SCORE_CALCULATION_METHOD_CHANGED, method)
  )
)
