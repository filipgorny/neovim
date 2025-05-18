import { findExamsByType } from '../exam-repository'

export default async (type: string) => (
  findExamsByType(type)
)
