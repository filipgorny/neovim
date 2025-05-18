import * as R from 'ramda'
import { markAsRead } from '../student-book-content-course-topics-service'
import { findOneOrFail, find } from '../student-book-content-course-topics-repository'
import { toggleIsMastered } from '../../student-course-topics/student-course-topics-service'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

type Payload = {
  is_read: boolean,
}

const fetchBookContentCourseTopics = async (student_course_topic_id: string) => (
  find({ limit: { page: 1, take: 100 }, order: { by: 'id', dir: 'asc' } }, { student_course_topic_id, is_read: false, is_artificial: false })
)

const tryToMarkTopicAsMastered = async (topicId: string) => {
  const bookContentTopics = await R.pipeWith(R.andThen)([
    fetchBookContentCourseTopics,
    R.prop('data'),
    collectionToJson,
  ])(topicId)

  if (R.isEmpty(bookContentTopics)) {
    await toggleIsMastered(topicId, true)
  }
}

const markTopicAsNotMastered = async (topicId: string) => (
  toggleIsMastered(topicId, false)
)

export default async (id: string, payload: Payload) => {
  const bookContentTopic = await findOneOrFail({ id })

  await markAsRead(id, payload.is_read)

  if (payload.is_read) {
    await tryToMarkTopicAsMastered(bookContentTopic.student_course_topic_id)
  } else {
    await markTopicAsNotMastered(bookContentTopic.student_course_topic_id)
  }
}
