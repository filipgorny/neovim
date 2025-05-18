import { ContentQuestionReactionTypeEnum } from '../content-question-reaction-types'
import { updateEntity } from '../content-question-reactions-service'
import { findOneOrFail } from '../content-question-reactions-repository'
import { validateAnimationFileMimeType, validateSoundFileMimeType } from '../validation/validate-file-mime-type'
import { S3_PREFIX_CONTENT_QUESTION_REACTION } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'
import { Files } from '../../../types/files'

type Payload = {
  name: string,
  type: ContentQuestionReactionTypeEnum,
}

export default async (id: string, files: Files<['animation', 'sound']>, payload: Payload) => {
  const reaction = await findOneOrFail({ id })

  const { animation, sound } = files || {}

  if (animation) {
    validateAnimationFileMimeType(animation.mimetype)
  }

  if (sound) {
    validateSoundFileMimeType(sound.mimetype)
  }

  const animationKey = animation ? await uploadFile(animation.data, animation.mimetype, S3_PREFIX_CONTENT_QUESTION_REACTION) : reaction.animation
  const soundKey = sound ? await uploadFile(sound.data, sound.mimetype, S3_PREFIX_CONTENT_QUESTION_REACTION) : reaction.sound

  return updateEntity(id, {
    ...payload,
    animation: animationKey,
    sound: soundKey,
    id,
  })
}
