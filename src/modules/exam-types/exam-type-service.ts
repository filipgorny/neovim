import { create, patch } from './exam-type-repository'

export const createExamType = async (
  title: string,
  break_definition: string,
  type: string,
  subtype: string,
  section_count: number,
  question_amount: string,
  exam_length: string,
  section_titles: string,
  scaled_score_ranges: string,
  type_label?: string
) => (
  create({
    title,
    break_definition,
    type,
    subtype,
    section_count,
    question_amount,
    exam_length,
    section_titles,
    scaled_score_ranges,
    type_label,
  })
)

export const updateExamType = async (id, title: string, type_label?: string, section_titles?: string) => (
  patch(id, {
    title,
    section_titles,
    type_label,
  })
)
