export type CourseTopic = {
  id: string,
  course_id: string,
  topic: string,
  order: number,
  level: number,
}

export type CourseTopicDTO = Omit<CourseTopic, 'id'>
