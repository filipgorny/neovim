import * as R from 'ramda'
import moment from 'moment'
import { createBook as createBookEntity } from '../../../src/modules/books/book-service'
import { DATE_FORMAT_YMD } from '../../../src/constants'
import randomString from '../../../utils/string/random-string'
import { Book } from '../../../src/types/book'
import { randomExternalId } from '../../../src/modules/books/random-external-id'

const prepareTitle = (book) => R.pipe(
  R.juxt([
    R.prop('title'),
    () => ` - copy ${moment().format(DATE_FORMAT_YMD)} - `,
    () => randomString().substring(0, 4),
  ]),
  R.join('')
)(book)

const prepareBookEntity = R.pipe(
  R.applySpec({
    title: prepareTitle,
    tag: R.prop('tag'),
    tagColour: R.prop('tag_colour'),
    isArchived: R.always(true),
    imageUrl: R.prop('image_url'),
    chapterHeadingImageUrl: R.prop('chapter_heading_image_url'),
    externalId: randomExternalId,
  }),
  R.objOf('payload')
)

export const createBookFromOriginal = async (originalBook: Book) => {
  const book = await R.pipe(
    prepareBookEntity,
    createBookEntity
  )(originalBook)

  return book
}
