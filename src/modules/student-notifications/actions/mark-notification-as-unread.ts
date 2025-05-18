import { BookshelfEntity } from '../../../types/bookshelf-entity'
import { Student } from '../../../types/student'
import { patchWhere } from '../student-notifications-repository'

export default async (student: BookshelfEntity<Student>, id: string) => (
  patchWhere({ id, student_id: student.id }, { is_read: false })
)
