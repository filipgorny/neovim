
export type StudentFavouriteVideo = {
  id: string
  student_id: string
  resource_id: string
  video_id: string
  created_at?: string | Date
  course_id: string
}

export type StudentFavouriteVideoDTO = Omit<StudentFavouriteVideo, 'id'>
