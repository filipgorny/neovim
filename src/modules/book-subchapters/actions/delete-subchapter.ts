import { deleteSubchapter } from '../book-subchapter-service'

export default async (id: string) => (
  deleteSubchapter(true)(id)
)
