import { findOne, findOneOrFail, patch } from '../custom-event-groups-repository'

const moveEntityUp = async (course_id: string, id: string) => {
  const entity = await findOneOrFail({ id, course_id })
  const previousEntity = await findOne({ order: entity.order - 1, course_id })

  if (!previousEntity) {
    return entity
  }

  return Promise.all([
    patch(entity.id, { order: entity.order - 1 }),
    patch(previousEntity.id, { order: previousEntity.order + 1 }),
  ])
}

const moveEntityDown = async (course_id: string, id: string) => {
  const entity = await findOneOrFail({ id, course_id })
  const nextEntity = await findOne({ order: entity.order + 1, course_id })

  if (!nextEntity) {
    return entity
  }

  return Promise.all([
    patch(entity.id, { order: entity.order + 1 }),
    patch(nextEntity.id, { order: nextEntity.order - 1 }),
  ])
}

const REORDER = {
  up: moveEntityUp,
  down: moveEntityDown,
}

export default async (course_id: string, id: string, direction: string) => (
  REORDER[direction](course_id, id)
)
