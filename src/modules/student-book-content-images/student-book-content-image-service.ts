import { create, deleteAttachmentsByContentId } from './student-book-content-image-repository'
import { makeDTO } from './dto/student-book-content-image-dto'
import mapP from '../../../utils/function/mapp'
import R from 'ramda'
import asAsync from '../../../utils/function/as-async'

export const createBookContentImage = async (
  content_id: string,
  image: string,
  small_ver: string,
  order: number,
  original_image_id: string
) => (
  create(
    makeDTO(content_id, image, small_ver, order, original_image_id)
  )
)

export const cretateBookContentImagesFromOriginal = async (contentId, originals) => (
  mapP(
    R.pipeWith(R.andThen)([
      asAsync(R.juxt([
        R.always(contentId),
        R.prop('image'),
        R.prop('small_ver'),
        R.prop('order'),
        R.prop('id'),

      ])),
      R.apply(createBookContentImage),
    ])
  )(originals)
)

export const deleteByContentId = async (content_id: string) => (
  deleteAttachmentsByContentId(content_id)
)
