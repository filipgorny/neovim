import R from 'ramda'
import { customException, throwException } from '../../utils/error/error-factory'

const throwInvalidVideoSourceException = () => throwException(customException('video.invalid-source', 422, 'Source is not vimeo url'))

export default R.pipe(
  R.when(
    R.pipe(
      R.match(/^.*vimeo\.com\//),
      R.isEmpty
    ),
    throwInvalidVideoSourceException
  ),
  R.replace(/^.*vimeo\.com\/(video\/)?/, ''),
  R.replace(/(\/.*)?(\?.*)?/, '')
)
