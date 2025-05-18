import { createMcatDate } from '../mcat-dates-service'

type Payload = {
  mcat_date: string
  course_id: string
}

export default async (payload: Payload) => (
  createMcatDate(payload)
)
