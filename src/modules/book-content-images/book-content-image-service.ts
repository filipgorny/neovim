import * as R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import mapP from '../../../utils/function/mapp'
import { create, patch, findOneOrFail, fixBookContentOrderAfterDeleting, remove, removeWhere } from './book-content-image-repository'
import { makeDTO } from './dto/book-content-image-dto'

export const createBookContentImage = async (content_id: string, order: number, image: string, small_ver: string) => (
  create(
    makeDTO(content_id, order, image, small_ver)
  )
)

export const updateBookContentImage = async (id: string, image: string, small_ver: string) => (
  patch(id, {
    image,
    small_ver,
  })
)

export const deleteBookContentImage = async (id: string) => {
  const image = await findOneOrFail({ id })
  const result = await remove(id)

  await fixBookContentOrderAfterDeleting(image.content_id, image.order)

  return result
}

export const createBookContentImagesFromOriginal = async (contentId, originals) => (
  mapP(
    R.pipeWith(R.andThen)([
      asAsync(R.juxt([
        R.always(contentId),
        R.prop('order'),
        R.prop('image'),
        R.prop('small_ver'),

      ])),
      R.apply(createBookContentImage),
    ])
  )(originals)
)

export const removeImagesByBookContentId = async (contentId: string) => (
  removeWhere({ content_id: contentId })
)
