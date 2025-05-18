import { ScoreCalculationMethod } from '../score-calculation-methods'

type ExamDTO = {
  layout_id: string,
  title: string,
  file_name: string,
  uploaded_by: string,
  external_id?: string,
  access_period: number,
  exam_length: object,
  is_active: boolean,
  exam_type_id: string,
  google_form_url: string,
  score_calculation_method: ScoreCalculationMethod,
  max_completions: number,
  periodic_table_enabled?: boolean,
  custom_title?: string
}

export const makeDTO = (
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
): ExamDTO => ({
  layout_id,
  title,
  file_name,
  uploaded_by,
  external_id,
  access_period,
  exam_length,
  is_active: true,
  exam_type_id,
  google_form_url,
  score_calculation_method,
  max_completions,
  periodic_table_enabled,
  custom_title,
})

export default ExamDTO
