import { StudentCourse } from '../../../types/student-course'
import { fetchFavoriteVideos } from '../student-videos-repository'

export default async (studentCourse: StudentCourse, query, student) => {
  return fetchFavoriteVideos(student.id, studentCourse)(query)
}
