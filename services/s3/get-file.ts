import R from 'ramda'
import mime from 'mime-types'
import { s3Client } from './s3-client'
import env from '../../utils/env'

const fileFormat = (fileName): string => R.pipe(
  R.head,
  mime.lookup,
  R.invoker(0, 'toString')
)(fileName.match(/\.[^\\.]+$/gi))

export default async key => {
  try {
    const fileData = await s3Client().getObject({
      Key: key,
      Bucket: env('AWS_S3_BUCKET'),
    }).promise()

    return {
      format: `${fileFormat(key)};base64`,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      image: fileData.Body.toString('base64'),
    }
  } catch (e) {
    console.log(e)
  }
}
