import R from 'ramda'
import { createBook } from '../book-service'
import { createChapter } from '../../book-chapters/book-chapter-service'
import { checkIfAlreadyExists } from '../validation/check-if-exists'
import { UploadedFile } from 'express-fileupload'
import { BookTagColourEnum } from '../book-tag-colours'
import { checkIfExternalIdAlreadyExists } from '../validation/check-if-external-id-exists'
import { checkIfTitleAlreadyExists } from '../validation/check-if-title-exists'
import { randomExternalId } from '../random-external-id'

export interface InitialiseBookPayload {
  title: string,
  firstChapterTitle: string,
  externalId?: string,
  tag: string,
  tagColour: BookTagColourEnum
  image?: null,
  imageUrl: string | null,
  chapterHeadingImageUrl: string | null,
  coverImageUrl: string | null,
  isTestBundle: boolean,
  isArchived?: boolean,
  headerAbbreviation: string,
  codename?: string,
}

const createBookWithFirstChapter = R.curry(async (imageFile: UploadedFile | undefined, chapterHeadingImageFile: UploadedFile | undefined, coverImageFile: UploadedFile | undefined, { firstChapterTitle, ...payload }: InitialiseBookPayload) => {
  const book = await createBook({
    payload,
    imageFile,
    chapterHeadingImageFile,
    coverImageFile,
  })

  await createChapter(firstChapterTitle, 1, book.id)

  return book
})

const generateExternalId = async (payload: InitialiseBookPayload) => (
  {
    ...payload,
    externalId: randomExternalId(),
  }
)

export default async (payload: InitialiseBookPayload, imageFile?: UploadedFile, chapterHeadingImageFile?: UploadedFile, coverImageFile?: UploadedFile) => (
  R.pipeWith(R.andThen)([
    generateExternalId,
    checkIfTitleAlreadyExists(),
    checkIfExternalIdAlreadyExists(),
    createBookWithFirstChapter(imageFile, chapterHeadingImageFile, coverImageFile),
  ])(payload)
)
