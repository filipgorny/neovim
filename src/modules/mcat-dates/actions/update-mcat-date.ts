import { patchMcatDate } from '../mcat-dates-service'

type Payload = {
  mcat_date: string
  course_id: string
}

export default async (id: string, payload: Payload) => (
  patchMcatDate(id, payload)
)
