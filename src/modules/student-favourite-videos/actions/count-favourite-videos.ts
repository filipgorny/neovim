import { countFavouriteVideos } from '../student-favourite-videos-repository'

export default async (student, studentCourse) => (
  countFavouriteVideos(student.id, studentCourse.id) // todo this has to include both tables
)
