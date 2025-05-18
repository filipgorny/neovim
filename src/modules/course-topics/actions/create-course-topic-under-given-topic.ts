import { getNextOrderByCourseId, findOneOrFail as findCourseTopic, incrementOrdersGreaterThanGivenOrder } from '../course-topics-repository'
import { createEntity } from '../course-topics-service'

type Payload = {
  topic: string,
  level: number,
}

export default async (course_id: string, course_topic_id: string, payload: Payload) => {
  const courseTopic = await findCourseTopic({ id: course_topic_id, course_id })

  await incrementOrdersGreaterThanGivenOrder(course_id, courseTopic.order)

  return createEntity({
    course_id,
    order: courseTopic.order + 1,
    ...payload,
  })
}
