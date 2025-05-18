import { findFavouriteVideos } from '../student-favourite-videos-service'

export default async (student, studentCourse) => (
  findFavouriteVideos(student.id, studentCourse.id)
)
