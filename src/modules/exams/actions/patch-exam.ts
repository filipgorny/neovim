import { logExternalIdUpdated, logScoreCalculationMethodChanged, logTitleUpdated } from '../../exam-logs/exam-logs-service'
import { validateTitleIsUnique } from '../validation/validate-title-is-unique'
import { patch, findOneOrFail } from '../exam-repository'
import { validateExternalIdIsUnique } from '../validation/validate-external-id-is-unique'
import reuploadXlsx from './reupload-xlsx'

type Payload = {
  title: string
  external_id: string
  google_form_url: string | null
  score_calculation_method: string
  max_completions?: number
  custom_title?: string
  periodic_table_enabled?: boolean
}

const isValueChanged = (exam, payload: Payload, prop: string) => (
  exam[prop] !== payload[prop]
)

export default async (exam_id: string, payload: Payload, files, user) => {
  await validateExternalIdIsUnique(payload.external_id, exam_id)
  await validateTitleIsUnique(payload.title, exam_id)

  const exam = await findOneOrFail({ id: exam_id })

  await patch(exam_id, {
    ...payload,
    file_name: files ? files.file.name : exam.file_name,
  })

  if (isValueChanged(exam, payload, 'external_id')) {
    await logExternalIdUpdated(exam_id, user.id, payload.external_id)
  }

  if (isValueChanged(exam, payload, 'title')) {
    await logTitleUpdated(exam_id, user.id, payload.title)
  }

  if (isValueChanged(exam, payload, 'score_calculation_method')) {
    await logScoreCalculationMethodChanged(exam_id, user.id, payload.score_calculation_method)
  }

  if (files) {
    await reuploadXlsx(exam_id, files, user)
  }
}
