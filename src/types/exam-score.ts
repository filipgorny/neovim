export type ExamScore = {
  id: string,
  exam_id: string,
  score: number,
  percentile_rank: number,
  percentage: number,
}

export type ExamScoreDTO = Omit<ExamScore, 'id'>
