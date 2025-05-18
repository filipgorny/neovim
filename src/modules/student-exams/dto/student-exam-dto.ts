import moment from 'moment'

type StudentExamDTO = {
  layout_id: string,
  student_id: string,
  exam_id: string,
  external_id: string,
  title: string,
  access_period: number,
  exam_length: object,
  break_definition: string,
  exam_type_id: string,
  external_created_at: string,
  revision: Date,
  course_id?: string,
  is_free_trial: boolean,
  periodic_table_enabled: boolean,
  max_completions: number,
  free_trial_featured_exam: boolean,
}

export const makeDTO = (
  layout_id: string,
  student_id: string,
  exam_id: string,
  external_id: string,
  title: string,
  access_period: number,
  exam_length: object,
  break_definition: string,
  exam_type_id: string,
  external_created_at: string,
  revision: Date,
  is_free_trial: boolean,
  periodic_table_enabled: boolean,
  max_completions: number,
  free_trial_featured_exam: boolean
): StudentExamDTO => ({
  layout_id,
  student_id,
  exam_id,
  title,
  external_id,
  access_period,
  exam_length,
  break_definition,
  exam_type_id,
  external_created_at: moment(external_created_at).format('YYYY-MM-DD'),
  revision,
  is_free_trial,
  periodic_table_enabled,
  max_completions,
  free_trial_featured_exam,
})

export default StudentExamDTO
