type ExamIntroPageDTO = {
  exam_type_id: string,
  order: number,
  raw: string,
  delta_object?: string
}

export const makeDTO = (raw: string, delta_object: string, exam_type_id: string, order: number) => ({
  raw,
  delta_object,
  exam_type_id,
  order,
})

export default ExamIntroPageDTO
