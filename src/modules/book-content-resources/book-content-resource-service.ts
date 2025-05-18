import * as R from 'ramda'
import { create, patch, deleteResource, fixBookContentResourceOrderAfterDeleting } from './book-content-resource-repository'
import { findOneOrFailWithDeleted as findContent } from '../book-contents/book-content-repository'
import { BookContentResourceType, BookContentResourceTypeEnum } from './book-contennt-resource-types'
import { makeDTO } from './dto/book-content-resource-dto'
import mapP from '../../../utils/function/mapp'
import { copyAndArchiveVideoById } from '../videos/video-service'

export const createBookContentResource = async (type: BookContentResourceType, order: number, raw: string, delta_object: string, content_id: string, external_id?: string, trx?) => (
  create(
    makeDTO(type, order, raw, delta_object, content_id, external_id), trx
  )
)

export const updateBookContentResource = async (id: string, raw: string, delta_object: string, external_id?: string) => (
  patch(
    id, {
      raw,
      delta_object,
      external_id,
    }
  )
)

export const removeResourceInTrx = async (resource, trx?) => {
  const order = resource.order
  const content_id = resource.content_id

  await fixBookContentResourceOrderAfterDeleting(trx)(content_id, order)

  return deleteResource(resource.id, trx)
}

export const removeVideosByBookContentId = async (content_id: string) => {
  const content = await findContent({ id: content_id }, ['videoResources'])
  const videos = R.prop('videoResources')(content)

  return mapP(removeResourceInTrx)(videos)
}

export const createBookContentResourcesFromOriginal = async (contentId, originalResources) => (
  mapP(
    R.pipeWith(R.andThen)([
      async resource => {
        let newVideo

        if (R.propEq('type', BookContentResourceTypeEnum.video, resource)) {
          newVideo = await copyAndArchiveVideoById(R.prop('external_id')(resource))
        }

        return R.juxt([
          R.prop('type'),
          R.prop('order'),
          R.prop('raw'),
          R.prop('delta_object'),
          R.always(contentId),
          R.ifElse(
            R.propEq('type', BookContentResourceTypeEnum.video),
            () => newVideo.id,
            R.always(null)
          ),
        ])(resource)
      },
      R.apply(createBookContentResource),
    ])
  )(originalResources)
)
