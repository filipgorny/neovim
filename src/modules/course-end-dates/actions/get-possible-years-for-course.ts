import { getPossibleYears } from '../course-end-dates-repository'

export default async (course_id: string) => (
  getPossibleYears(course_id)
)
