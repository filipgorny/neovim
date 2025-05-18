import R from 'ramda'
import mime from 'mime'
import { customException, throwException } from '../../../../utils/error/error-factory'

const validFileExtensions = ['png', 'jpg', 'jpeg', 'svg', 'json', 'gif']

const validateSingleFileMimeType = file => R.pipe(
  R.prop('mimetype'),
  // @ts-ignore
  (type: string) => mime.extension(type),
  extension => validFileExtensions.includes(extension),
  R.ifElse(
    R.not,
    R.always(`"${file[0]}"`),
    R.always(undefined)
  )
)(file[1])

export const validateFilesMimeType = files => R.pipe(
  R.toPairs,
  R.map(validateSingleFileMimeType),
  R.filter(R.identity),
  R.when(
    list => !R.isEmpty(list),
    messages => throwException(customException('file.invalid', 400, `${messages.join(', ')} extension invalid, only ${validFileExtensions.join(', ')} are acceptable`))
  )
)(files)
