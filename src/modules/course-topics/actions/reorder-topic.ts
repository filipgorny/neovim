import { findOne, findOneOrFail, patch } from '../course-topics-repository'

const moveTopicUp = async (course_id: string, id: string) => {
  const topic = await findOneOrFail({ id, course_id })
  const previousTopic = await findOne({ order: topic.order - 1, course_id })

  if (!previousTopic) {
    return topic
  }

  return Promise.all([
    patch(topic.id, { order: topic.order - 1 }),
    patch(previousTopic.id, { order: previousTopic.order + 1 }),
  ])
}

const moveTopicDown = async (course_id: string, id: string) => {
  const topic = await findOneOrFail({ id, course_id })
  const nextTopic = await findOne({ order: topic.order + 1, course_id })

  if (!nextTopic) {
    return topic
  }

  return Promise.all([
    patch(topic.id, { order: topic.order + 1 }),
    patch(nextTopic.id, { order: nextTopic.order - 1 }),
  ])
}

const REORDER = {
  up: moveTopicUp,
  down: moveTopicDown,
}

export default async (course_id: string, id: string, direction: string) => (
  REORDER[direction](course_id, id)
)
