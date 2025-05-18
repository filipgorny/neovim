import { setTheme } from '../student-service'

type Payload = {
  theme: string,
}

export default async (student, payload: Payload) => (
  setTheme(student.id, payload.theme)
)
