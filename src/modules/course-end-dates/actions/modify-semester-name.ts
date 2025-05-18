import { patchSemesterName } from '../course-end-dates-service'

type Payload = {
  semester_name: string,
}

export default async (id: string, payload: Payload) => (
  patchSemesterName(id, payload.semester_name)
)
