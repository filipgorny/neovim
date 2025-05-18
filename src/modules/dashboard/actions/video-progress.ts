import { StudentCourse } from '../../../types/student-course'
import { getBookVideosWatchedPercentage } from '../../student-videos/student-videos-repository'

export default async (student, studentCourse: StudentCourse) => (
  {
    book_videos_watched_percentage: await getBookVideosWatchedPercentage(studentCourse),
  }
)
