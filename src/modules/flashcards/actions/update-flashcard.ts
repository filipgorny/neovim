import R from 'ramda'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { fileSchema } from '../validation/schema/update-flashcard-schema'
import { findOneOrFail, patch } from '../flashcard-repository'
import { validateFilesMimeType } from '../validation/validate-files-mime-type'
import uploadFile from '../../../../services/s3/upload-file'
import { S3_PREFIX_FLASHCARDS } from '../../../../services/s3/s3-file-prefixes'
import generateStaticUrl from '../../../../services/s3/generate-static-url'

const uploadFileToS3AndGetUrl = async (oldKey, image) => {
  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_FLASHCARDS, true)

  return key
}

const prepareAndSaveResource = (id, files) => async payload => {
  const flashcard = await findOneOrFail({ id })
  const shouldReuploadFile = Boolean(files)
  const preparedFiles = {
    question_image: undefined,
    explanation_image: undefined,
  }

  if (shouldReuploadFile) {
    validateFilesPayload(fileSchema)(files)
    validateFilesMimeType(files)

    preparedFiles.question_image = files.questionImage ? await uploadFileToS3AndGetUrl(flashcard.question_image, files.questionImage) : undefined
    preparedFiles.explanation_image = files.explanationImage ? await uploadFileToS3AndGetUrl(flashcard.explanation_image, files.explanationImage) : undefined
  }

  if (payload.questionImage === null || payload.questionImage === 'null') {
    preparedFiles.question_image = null
    payload.questionImage = undefined
  }

  if (payload.explanationImage === null || payload.explanationImage === 'null') {
    preparedFiles.explanation_image = null
    payload.explanationImage = undefined
  }

  return patch(flashcard.id, {
    ...payload,
    ...preparedFiles,
  })
}

export default async (id, files, payload) => (
  R.pipeWith(R.andThen)([
    prepareAndSaveResource(id, files),
    R.invoker(0, 'toJSON'),
    R.evolve({
      question_image: value => value ? generateStaticUrl(value) : null,
      explanation_image: value => value ? generateStaticUrl(value) : null,
    }),
  ])(payload)
)
