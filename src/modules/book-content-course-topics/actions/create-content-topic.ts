import * as R from 'ramda'
import mapP from '../../../../utils/function/mapp'
import { createCommentOrIgnore } from '../../book-content-comments/book-content-comments-service'
import { findCourseTopicWithAllParents } from '../../course-topics/course-topics-service'
import { markBookContentWithCourseTopic } from '../book-content-course-topics-service'

const handleBookContentTopics = async (book_content_id: string, courseTopics) => (
  R.addIndex(mapP)(async (courseTopic, i) => (
    markBookContentWithCourseTopic(book_content_id, courseTopic.id, i > 0)
  ))(courseTopics)
)

export default async (book_content_id: string, course_topic_id: string) => {
  const attached = await R.pipeWith(R.andThen)([
    findCourseTopicWithAllParents,
    async (courseTopics) => ({
      book_content_topics: await handleBookContentTopics(book_content_id, courseTopics),
      course_topics: courseTopics,
    }),
  ])(course_topic_id)

  await createCommentOrIgnore({
    book_content_id,
    comment_delta_object: { ops: [] },
    comment_html: '',
    comment_raw: '',
    course_id: attached.course_topics[0].course_id,
  })

  return attached
}
