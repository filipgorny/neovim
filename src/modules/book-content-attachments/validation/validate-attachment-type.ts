import * as R from 'ramda'
import { invalidAttachmentTypeException, throwException } from '../../../../utils/error/error-factory'
import { BookContentAttachmentTypeEnum } from '../book-content-attachment-types'

const validateType = (validTypes: string[]) => R.unless(
  R.propSatisfies(
    R.includes(R.__, validTypes),
    'type'
  ),
  () => throwException(invalidAttachmentTypeException(validTypes))
)

export const validateAttachmentIsTextType = validateType(
  [BookContentAttachmentTypeEnum.main_text, BookContentAttachmentTypeEnum.salty_comment]
)

export const validateAttachmentIsFileType = validateType(
  [BookContentAttachmentTypeEnum.file]
)
