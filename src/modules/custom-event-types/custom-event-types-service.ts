import R from 'ramda'
import snakeCase from 'lodash.snakecase'
import { create, patch, deleteRecord, getNextOrderByGroupId, findOneOrFail, fixCustomEventTypeOrderAfterDeleting } from './custom-event-types-repository'

type Payload = {
  custom_event_group_id: string
  title: string
  duration?: number
}

export const createCustomEventType = async (dto: Payload) => (
  create({
    ...dto,
    slug: snakeCase(dto.title),
    order: await getNextOrderByGroupId(dto.custom_event_group_id),
    duration: dto.duration || 375,
  })
)

export const updateCustomEventType = async (id: string, dto: Payload) => (
  patch(id, {
    ...dto,
    slug: snakeCase(dto.title),
  })
)

export const deleteCustomEventType = async (id: string) => {
  const entity = await findOneOrFail({ id })
  const result = await deleteRecord(id)

  await fixCustomEventTypeOrderAfterDeleting(entity.custom_event_group_id, entity.order)

  return result
}

export const copyCustomEventTypeForNewGroup = (newGroupId: string) => async (customEventType) => {
  return create(
    R.omit(['id'])({
      ...customEventType,
      custom_event_group_id: newGroupId,
    })
  )
}
