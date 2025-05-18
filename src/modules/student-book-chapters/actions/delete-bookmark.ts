import { deleteBookmark } from '../student-book-chapter-service'
import { validateChapterBelongsToStudent } from '../validation/validate-chapter-belongs-to-student'

export default async (user, id: string) => {
  await validateChapterBelongsToStudent(user.id, id)

  return deleteBookmark(id)
}
