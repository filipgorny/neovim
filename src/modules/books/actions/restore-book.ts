import { restoreBook } from '../book-service'

export default async (id: string) => (
  restoreBook(id)
)
