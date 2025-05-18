type StudentExamScoreDto = {
  exam_type_id: string,
  scores: string,
  student_id: string,
  is_ts_attached_to_pts: boolean
}

export type ExamScoreDto = {
  order: number,
  name: string,
  target_score: number,
  pts: number
}

export const makeDTO = (exam_type_id: string, scores: ExamScoreDto[], student_id: string, is_ts_attached_to_pts: boolean = true): StudentExamScoreDto => ({
  exam_type_id,
  scores: JSON.stringify(scores),
  student_id,
  is_ts_attached_to_pts,
})

export default StudentExamScoreDto
