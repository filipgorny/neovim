import { deleteRecord } from '../course-end-dates-repository'

export default async (id: string) => (
  deleteRecord(id)
)
