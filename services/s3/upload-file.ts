import mime from 'mime-types'
import crypto from 'crypto'
import { s3Client } from './s3-client'
import env from '../../utils/env'

const randomString = () => crypto.randomBytes(20).toString('hex')
const makefileNameWithExtension = (fileName: string, contentType: string) => `${fileName}.${mime.extension(contentType)}`

export default async (imageData: Buffer, imageMimeType: string, keyPrefix: string, includePublicACL = false) => {
  try {
    const key = `${keyPrefix}/${makefileNameWithExtension(randomString(), imageMimeType)}`

    await s3Client().putObject({
      ContentType: imageMimeType,
      Key: key,
      Body: imageData,
      Bucket: env('AWS_S3_BUCKET'),
      ...includePublicACL && { ACL: 'public-read' },
    }).promise()

    return key
  } catch (e) {
    console.log(e)

    return null
  }
}
