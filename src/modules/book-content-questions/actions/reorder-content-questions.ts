import R from 'ramda'
import { findClosestInDirectionBySubchapterId, findOneOrFail, patch } from '../../book-content-questions/book-content-questions-repository'

const moveContentQuestionUp = async (content_id: string, question_id: string) => {
  const item = await findOneOrFail({ question_id, content_id }, ['content'])
  const previousItem = await findClosestInDirectionBySubchapterId(item.content.subchapter_id, item.subchapter_order, 'desc')

  if (!previousItem) {
    return item
  }

  return Promise.all([
    patch(item.id, { subchapter_order: previousItem.subchapter_order }),
    patch(previousItem.id, { subchapter_order: item.subchapter_order }),
  ])
}

const moveContentQuestionDown = async (content_id: string, question_id: string) => {
  const item = await findOneOrFail({ question_id, content_id }, ['content'])
  const nextItem = await findClosestInDirectionBySubchapterId(item.content.subchapter_id, item.subchapter_order, 'asc')

  if (!nextItem) {
    return item
  }

  return Promise.all([
    patch(item.id, { subchapter_order: nextItem.subchapter_order }),
    patch(nextItem.id, { subchapter_order: item.subchapter_order }),
  ])
}

const REORDER = {
  up: moveContentQuestionUp,
  down: moveContentQuestionDown,
}

export default async (question_id: string, content_id: string, direction: string) => (
  REORDER[direction](content_id, question_id)
)
