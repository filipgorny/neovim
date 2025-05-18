import * as R from 'ramda'
import snakeCase from 'lodash.snakecase'
import { create, patch, deleteRecord, getNextOrderByCourseId, findOneOrFail, fixCustomEventGroupOrderAfterDeleting } from './custom-event-groups-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { copyCustomEventTypeForNewGroup } from '../custom-event-types/custom-event-types-service'

type Payload = {
  course_id: string
  title: string
  colour_gradient_start?: string
  colour_gradient_end?: string
  colour_font?: string
}

export const createCustomEventGroup = async (dto: Payload) => (
  create({
    ...dto,
    slug: snakeCase(dto.title),
    colour_gradient_start: dto.colour_gradient_start || '#e0e0e0',
    colour_gradient_end: dto.colour_gradient_end || '#f0f0f0',
    colour_font: dto.colour_font || '#333333',
    order: await getNextOrderByCourseId(dto.course_id),
  })
)

export const updateCustomEventGroup = async (id: string, dto: Payload) => (
  patch(id, {
    ...dto,
    slug: snakeCase(dto.title),
  })
)

export const deleteCustomEventGroup = async (id: string) => {
  const entity = await findOneOrFail({ id })
  const result = await deleteRecord(id)

  await fixCustomEventGroupOrderAfterDeleting(entity.course_id, entity.order)

  return result
}

export const copyCustomEventGroupForNewCourse = (newCourseId: string) => async (customEventGroup) => {
  const newEventGroup = await create(
    R.omit(['id', 'customEventTypes'])({
      ...customEventGroup,
      course_id: newCourseId,
    })
  )

  await mapP(
    async customEventType => copyCustomEventTypeForNewGroup(newEventGroup.id)(customEventType)
  )(customEventGroup.customEventTypes)

  return newEventGroup
}
