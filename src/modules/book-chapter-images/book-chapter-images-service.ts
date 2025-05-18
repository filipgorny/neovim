import * as R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import mapP from '../../../utils/function/mapp'
import {
  create,
  patch,
  findOneOrFail,
  fixBookContentOrderAfterDeleting,
  remove,
  removeWhere
} from './book-chapter-images-repository'
import { makeDTO } from './dto/book-chapter-image-dto'
import { findOneOrFail as findBookChapter } from '../../modules/book-chapters/book-chapter-repository'

export const createBookChapterImage = async (content_id: string, order: number, image: string, small_ver: string) => (
  create(
    makeDTO(content_id, order, image, small_ver)
  )
)

export const updateBookChapterImage = async (id: string, image: string, small_ver: string) => (
  patch(id, {
    image,
    small_ver,
  })
)

export const deleteBookContentImage = async (id: string) => {
  const image = await findOneOrFail({ id })
  const result = await remove(id)

  await fixBookContentOrderAfterDeleting(image.chapter_id, image.order)

  return result
}

export const removeChapterImageByChapterId = async (chapterId: string) => (
  removeWhere({ chapter_id: chapterId })
)

export const copyChapterImages = async (original_chapter_id: string, chapter_id: string) => (
  R.pipeWith(R.andThen)([
    async () => findBookChapter({ id: original_chapter_id }, ['images']),
    R.prop('images'),
    R.map(
      R.pipe(
        R.omit(['id', 'chapter_id']),
        R.set(
          R.lensProp('chapter_id'),
          chapter_id
        )
      )
    ),
    mapP(create),
  ])(true)
)

// export const createBookContentImagesFromOriginal = async (contentId, originals) => (
//   mapP(
//     R.pipeWith(R.andThen)([
//       asAsync(R.juxt([
//         R.always(contentId),
//         R.prop('order'),
//         R.prop('image'),
//         R.prop('small_ver'),

//       ])),
//       R.apply(createBookContentImage),
//     ])
//   )(originals)
// )
