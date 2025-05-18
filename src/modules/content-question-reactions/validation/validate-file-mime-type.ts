import R from 'ramda'
import mime from 'mime'
import { customException, throwException } from '../../../../utils/error/error-factory'

const validAnimationExtensions = ['json']
const validSoundExtensions = ['mpga']

const validateFileMimeType = validExtensions => mimeType => R.pipe(
  // @ts-ignore
  type => mime.extension(type),
  extension => validExtensions.includes(extension),
  R.when(
    R.not,
    () => throwException(customException('file.invalid', 400, `only ${validExtensions.join(', ')} are acceptable`))
  )
)(mimeType)

export const validateAnimationFileMimeType = validateFileMimeType(validAnimationExtensions)
export const validateSoundFileMimeType = validateFileMimeType(validSoundExtensions)
