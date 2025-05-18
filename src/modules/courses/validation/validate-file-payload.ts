import R from 'ramda'
import mime from 'mime'
import { customException, throwException } from '../../../../utils/error/error-factory'

const validFileExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg']

export const validateFileMimeType = (mimeType: string) => R.pipe(
  // @ts-ignore
  type => mime.extension(type),
  extension => validFileExtensions.includes(extension),
  R.when(
    R.not,
    () => throwException(customException('file.invalid', 400, `only ${validFileExtensions.join(', ')} are acceptable`))
  )
)(mimeType)
