import { findOne, findOneOrFail, patch } from '../custom-event-types-repository'

const moveEntityUp = async (custom_event_group_id: string, id: string) => {
  const entity = await findOneOrFail({ id, custom_event_group_id })
  const previousEntity = await findOne({ order: entity.order - 1, custom_event_group_id })

  if (!previousEntity) {
    return entity
  }

  return Promise.all([
    patch(entity.id, { order: entity.order - 1 }),
    patch(previousEntity.id, { order: previousEntity.order + 1 }),
  ])
}

const moveEntityDown = async (custom_event_group_id: string, id: string) => {
  const entity = await findOneOrFail({ id, custom_event_group_id })
  const nextEntity = await findOne({ order: entity.order + 1, custom_event_group_id })

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

export default async (custom_event_group_id: string, id: string, direction: string) => (
  REORDER[direction](custom_event_group_id, id)
)
