export type BookContentCourseTopic = {
  id: string,
  course_id: string,
  course_topic_id: string,
  book_id: string,
  book_content_id: string,
  is_artificial: boolean,
}

export type BookContentCourseTopicDTO = Omit<BookContentCourseTopic, 'id'>
