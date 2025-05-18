import { deleteBookContent } from '../book-content-service'

export default async (id) => (
  deleteBookContent()(id)
)
