import { getStudentExamsStatsData } from '../exam-service'

export default async (id: string) => (
  getStudentExamsStatsData(id, false)
)
