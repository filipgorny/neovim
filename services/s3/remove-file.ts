import { s3Client } from './s3-client'
import env from '../../utils/env'

export default async (key: string) => {
  try {
    await s3Client().deleteObject({
      Key: key,
      Bucket: env('AWS_S3_BUCKET'),
    }).promise()

    return true
  } catch (e) {
    console.log({ e })
  }
}
