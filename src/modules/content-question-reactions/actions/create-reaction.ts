import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { ContentQuestionReactionTypeEnum } from '../content-question-reaction-types'
import { createEntity } from '../content-question-reactions-service'
import { fileSchema } from '../validation/schema/create-reaction-schema'
import { validateAnimationFileMimeType, validateSoundFileMimeType } from '../validation/validate-file-mime-type'
import { S3_PREFIX_CONTENT_QUESTION_REACTION } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'
import { Files } from '../../../types/files'

type Payload = {
  name: string,
  type: ContentQuestionReactionTypeEnum,
}

export default async (files: Files<['animation', 'sound']>, payload: Payload) => {
  validateFilesPayload(fileSchema)(files)

  const { animation, sound } = files

  validateAnimationFileMimeType(animation.mimetype)
  validateSoundFileMimeType(sound.mimetype)

  const animationKey = await uploadFile(animation.data, animation.mimetype, S3_PREFIX_CONTENT_QUESTION_REACTION)
  const soundKey = await uploadFile(sound.data, sound.mimetype, S3_PREFIX_CONTENT_QUESTION_REACTION)

  return createEntity({
    ...payload,
    animation: animationKey,
    sound: soundKey,
  })
}
