import { deletePart } from '../book-chapter-service'

export default async (id: string, part: string) => (
  deletePart(id, part)
)
