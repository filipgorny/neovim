export type ExamSectionScore = {
  id: string,
  section_id: string,
  score: number,
  correct_answers: number,
  percentile_rank: number,
  percentage: number,
}

export type ExamSectionScoreDTO = Omit<ExamSectionScore, 'id'>
