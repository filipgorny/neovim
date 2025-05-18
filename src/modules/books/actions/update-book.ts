import R from 'ramda'
import { updateBook } from '../book-service'
import { checkIfAlreadyExists } from '../validation/check-if-exists'
import { findOneOrFail } from '../book-repository'
import { InitialiseBookPayload } from './initialise-book'
import { BookTagColourEnum } from '../book-tag-colours'
import { UploadedFile } from 'express-fileupload'
import { checkIfExternalIdAlreadyExists } from '../validation/check-if-external-id-exists'
import { checkIfTitleAlreadyExists } from '../validation/check-if-title-exists'

export interface UpdateBookPayload extends Partial<Pick<InitialiseBookPayload, 'title' | 'tag'>> {
  external_id: string
  tag_colour: BookTagColourEnum
  image?: null
  chapterHeadingImage?: null
  coverImage?: null
  header_abbreviation?: string
  codename?: string
}

const prepareBook = R.curry(async (id: string, payload: UpdateBookPayload) => {
  const book = await findOneOrFail({ id })

  if (['null', null].includes(payload.external_id)) {
    payload.external_id = null
  }

  await checkIfExternalIdAlreadyExists(book.id)(payload)
  await checkIfTitleAlreadyExists(book.id)(payload)

  return payload
})

export default async (id: string, payload: UpdateBookPayload, imageFile?: UploadedFile, chapterHeadingImageFile?: UploadedFile, coverImageFile?: UploadedFile) => (
  R.pipeWith(R.andThen)([
    prepareBook(id),
    updateBook(id, imageFile, chapterHeadingImageFile, coverImageFile),
  ])(payload)
)
