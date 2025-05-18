import { deleteCourseMapEntry } from '../course-map-service'

export default async (id: string, itemId: string) => (
  deleteCourseMapEntry(itemId)
)
