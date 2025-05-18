export type ExamType = {
  id: string,
  title: string,
  break_definition: object,
  type: string,
  subtype: string,
  section_count: number,
  question_amount: object,
  score_calculations_enabled: boolean,
  exam_scaled_score_template: object,
  exam_length: object
}
