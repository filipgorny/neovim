import R from 'ramda'
import { fileSchema } from '../validation/schema/create-flashcard-schema'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { createFlashcard } from '../flashcard-service'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import uploadFile from '../../../../services/s3/upload-file'
import { S3_PREFIX_FLASHCARDS } from '../../../../services/s3/s3-file-prefixes'
import { validateFilesMimeType } from '../validation/validate-files-mime-type'

const uploadFileToS3 = async image => {
  if (!image) return undefined

  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_FLASHCARDS, true)

  return key
}

const prepareAndSaveResource = files => async payload => {
  const shouldUploadFile = Boolean(files)
  const { question, raw_question, explanation, raw_explanation, question_html, explanation_html } = payload
  let questionImageUrl: string
  let explanationImageUrl: string

  if (shouldUploadFile) {
    validateFilesPayload(fileSchema)(files)
    validateFilesMimeType(files)

    questionImageUrl = await uploadFileToS3(files.questionImage)
    explanationImageUrl = await uploadFileToS3(files.explanationImage)
  }

  if (!shouldUploadFile && !question && !explanation) {
    return { toJSON: () => ({}) }
  }

  return createFlashcard(question, raw_question, questionImageUrl, explanation, raw_explanation, explanationImageUrl, question_html, explanation_html)
}

export default async (files, payload) => (
  R.pipeWith(R.andThen)([
    prepareAndSaveResource(files),
    R.invoker(0, 'toJSON'),
    R.evolve({
      question_image: value => value ? generateStaticUrl(value) : null,
      explanation_image: value => value ? generateStaticUrl(value) : null,
    }),
  ])(payload)
)
