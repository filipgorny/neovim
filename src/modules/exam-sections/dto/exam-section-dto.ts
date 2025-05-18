type ExamSectionDto = {
  exam_id: string,
  title: string,
  order: number,
  full_title: string,
  score_min: number,
  score_max: number,
}

export const makeDTO = (exam_id: string, title: string, order: number, full_title: string, score_min: number, score_max: number): ExamSectionDto => ({
  exam_id,
  title,
  order,
  full_title,
  score_min,
  score_max,
})

export default ExamSectionDto
