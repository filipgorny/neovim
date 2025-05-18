import { setFlashcardsAccessible } from '../book-service'

export default async (id: string, accessible: string) => (
  setFlashcardsAccessible(id, accessible)
)
