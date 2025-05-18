import { create, deleteContentById, patch, patchWhereIn } from './student-book-content-repository'
import { makeDTO } from './dto/student-book-content-dto'
import { BookContentType } from '../book-contents/book-content-types'
import { BookContentStatusEnum } from './book-content-statuses'
import R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import { cretateBookContentResourcesFromOriginal, deleteByContentId as deleteResources } from '../student-book-content-resources/student-book-content-resource-service'
import { cretateBookContentQuestionsFromOriginal, deleteByContentId as deleteQuestions } from '../student-book-content-questions/student-book-content-question-service'
import { cretateBookContentImagesFromOriginal, deleteByContentId as deleteImages } from '../student-book-content-images/student-book-content-image-service'
import { cretateBookContentFlashcardsFromOriginal, deleteByContentId as deleteFlashcards } from '../student-book-content-flashcards/student-book-content-flashcard-service'
import { cretateBookContentAttachmentsFromOriginal, deleteByContentId as deleteAttachments } from '../student-book-content-attachments/student-book-content-attachment-service'
import { deleteByContentId as deletePinNotes } from '../student-book-content-pins/student-book-content-pins-service'
import { deleteBySubchapterId as deleteNotes } from '../student-book-subchapter-notes/student-book-subchapter-notes-service'
import { UpdateBookContentPayload } from './actions/update-book-content'
import { findOneOrFail as findSubchapter } from '../student-book-subchapters/student-book-subchapter-repository'
import { deleteByContentId as deleteContentTopics } from '../student-book-content-course-topics/student-book-content-course-topics-repository'
import mapP from '../../../utils/function/mapp'
import forEachP from '../../../utils/function/foreachp'

export const createBookContent = async (raw: string, delta_object: string, type: BookContentType, subchapter_id: string, original_content_id: string, order: number) => (
  create(
    makeDTO(raw, delta_object, type, BookContentStatusEnum.unseen, subchapter_id, original_content_id, order)
  )
)

export const cretateBookContentsFromOriginalContents = (subchapterId) => async originalContent => {
  const originalResources = R.prop('resources')(originalContent)
  // const originalQuestions = R.prop('questions')(originalContent)
  const originalImages = R.prop('images')(originalContent)
  const originalFlashcards = R.prop('flashcards')(originalContent)
  const originalAttachments = R.prop('attachments')(originalContent)
  const content = await R.pipeWith(R.andThen)([
    asAsync(R.juxt([
      R.prop('raw'),
      R.prop('delta_object'),
      R.prop('type'),
      R.always(subchapterId),
      R.prop('id'),
      R.prop('order'),
    ])),
    R.apply(createBookContent),
  ])(originalContent)

  await cretateBookContentResourcesFromOriginal(content.id, originalResources)
  // await cretateBookContentQuestionsFromOriginal(content.id, originalQuestions)
  await cretateBookContentImagesFromOriginal(content.id, originalImages)
  await cretateBookContentFlashcardsFromOriginal(content.id, originalFlashcards)
  await cretateBookContentAttachmentsFromOriginal(content.id, originalAttachments)

  return content
}

interface UpdateBookContentCommand {
  id: string;
}

export const updateBookContent = (command: UpdateBookContentCommand) => async (payload: UpdateBookContentPayload) => {
  return await patch({
    id: command.id,
    data: {
      ...payload,
      delta_object: payload.delta_object ? JSON.stringify(payload.delta_object) : undefined,
    },
    select: ['id', 'raw', 'delta_object', 'type', 'content_status', 'order'],
  })
}

export const markPiecesAsSeenBySubchapters = async (subchapterIds) => (
  patchWhereIn('subchapter_id', subchapterIds, {
    content_status: BookContentStatusEnum.seen,
  })
)

export const deleteBySubchapterId = async (subchapter_id: string) => {
  const subchapter = await findSubchapter({ id: subchapter_id }, ['contents'])

  const contentIds = R.pipe(
    R.prop('contents'),
    R.pluck('id')
  )(subchapter)

  await Promise.all([
    forEachP(deleteFlashcards)(contentIds),
    forEachP(deleteQuestions)(contentIds),
    forEachP(deleteResources)(contentIds),
    forEachP(deleteAttachments)(contentIds),
    forEachP(deleteImages)(contentIds),
    forEachP(deletePinNotes)(contentIds),
    forEachP(deleteContentTopics)(contentIds),
  ])

  await deleteNotes(subchapter_id)

  await forEachP(deleteContentById)(contentIds)
}
