import { create, deleteResourcesByContentId, patch, find as findBookContentResource, deleteRecord as deleteBookContentResource, findOneOrFail, findOne, findWithQuery } from './student-book-content-resource-repository'
import { deleteRecord as deleteVideoActivityTimer } from '../video-activity-timers/video-activity-timers-repository'
import { makeDTO } from './dto/student-book-content-resource-dto'
import { BookContentResourceType } from '../book-content-resources/book-contennt-resource-types'
import mapP from '../../../utils/function/mapp'
import R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import { collectionToJson } from '../../../utils/model/collection-to-json'

export const createBookContentResource = async (
  content_id: string,
  raw: string,
  delta_object: string,
  external_id: string,
  order: string,
  type: BookContentResourceType,
  original_resource_id: string
) => (
  create(
    makeDTO(content_id, raw, delta_object, external_id, order, type, original_resource_id)
  )
)

export const cretateBookContentResourcesFromOriginal = async (contentId, originalResources) => (
  mapP(
    R.pipeWith(R.andThen)([
      asAsync(R.juxt([
        R.always(contentId),
        R.prop('raw'),
        R.prop('delta_object'),
        R.prop('external_id'),
        R.prop('order'),
        R.prop('type'),
        R.prop('id'),
      ])),
      R.apply(createBookContentResource),
    ])
  )(originalResources)
)

export const updateBookContentResource = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const markBookContentResourceAsRead = async (id: string) => (
  patch(id, {
    is_read: true,
  })
)

const deleteResourceVideoActivityTimers = R.pipe(
  R.pluck('videoActivityTimers'),
  R.flatten,
  R.pluck('id'),
  mapP(deleteVideoActivityTimer)
)

const deleteBookContentResources = R.pipe(
  R.pluck('id'),
  mapP(deleteBookContentResource)
)

const fetchBookContentResources = async (content_id) => findBookContentResource({ content_id }, ['videoActivityTimers'])

export const deleteByContentId = async (content_id: string) => (
  R.pipeWith(R.andThen)([
    fetchBookContentResources,
    R.prop('data'),
    collectionToJson,
    R.juxt([
      deleteResourceVideoActivityTimers,
      deleteBookContentResources,
    ]),
  ])(content_id)
)

export const fixVideosExternalIds = async () => {
  const contentResourceIdsForRemoval = []
  const RECORDS_PER_BATCH = 10

  for (let page = 1; ; page++) {
    const videoStudentResources = await R.pipeWith(R.andThen)([
      async () => findWithQuery({ limit: { page, take: RECORDS_PER_BATCH }, order: { by: 'id', dir: 'asc' } }, { type: 'video' }, ['content.originalContent.videoResources', 'video', 'originalResource', 'videoActivityTimers']),
      R.prop('data'),
      collectionToJson,
    ])(true)

    if (videoStudentResources.length === 0) {
      break
    }

    await mapP(async videoStudentResource => {
      if (videoStudentResource.video?.id) {
        console.log('video exists')
        return
      }

      if (videoStudentResource.originalResource.external_id && videoStudentResource.originalResource.external_id !== videoStudentResource.external_id) {
        console.log('originalResource exists')

        await updateBookContentResource(videoStudentResource.id, {
          external_id: videoStudentResource.originalResource.external_id,
        })
      } else if (videoStudentResource?.content?.originalContent?.videoResources && videoStudentResource?.content?.originalContent?.videoResources.length > 0) {
        console.log('original content video resource exists')

        await updateBookContentResource(videoStudentResource.id, {
          external_id: videoStudentResource.content.originalContent.videoResources[0].external_id,
          original_resource_id: videoStudentResource.content.originalContent.videoResources[0].id,
        })
      } else {
        console.log('removing')

        await mapP(
          async videoActivityTimer => await deleteVideoActivityTimer(videoActivityTimer.id)
        )(videoStudentResource.videoActivityTimers)

        contentResourceIdsForRemoval.push(videoStudentResource.id)
      }
    })(videoStudentResources)
  }

  for (let i = 0; i < contentResourceIdsForRemoval.length; i += RECORDS_PER_BATCH) {
    await mapP(
      deleteBookContentResource
    )(R.slice(i, i + RECORDS_PER_BATCH, contentResourceIdsForRemoval))
  }
}
