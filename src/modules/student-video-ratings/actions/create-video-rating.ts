import { earnSaltyBucksForRatingVideo } from '../../../../services/salty-bucks/salty-buck-service'
import { StudentCourse } from '../../../types/student-course'
import { createVideoRating, deleteVideoRating, findVideoRating } from '../student-video-ratings-service'

type Payload = {
  rating: number,
}

export default async (student, video_id: string, payload: Payload, studentCourse?: StudentCourse) => {
  const videoRating = await findVideoRating(student.id, video_id)
  if (!videoRating) {
    await earnSaltyBucksForRatingVideo(student.id, video_id, studentCourse)
  }

  await deleteVideoRating(student.id, video_id)

  return createVideoRating({
    ...payload,
    video_id,
    student_id: student.id,
  })
}
