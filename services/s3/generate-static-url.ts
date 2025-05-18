import R from 'ramda'
import env from '../../utils/env'

export default (key: string) => R.ifElse(
  R.isNil,
  R.always(null),
  R.always(`https://${env('AWS_S3_BUCKET')}.s3.amazonaws.com/${key}`)
)(key)
