import axios from 'axios'
import mime from 'mime-types'
import crypto from 'crypto'
import { s3Client } from './s3-client'
import env from '../../utils/env'

const randomString = () => crypto.randomBytes(20).toString('hex')

const makefileNameWithExtension = (fileName: string, contentType: string) => `${fileName}.${mime.extension(contentType)}`

const fetchAsArrayBuffer = async url => {
  return axios.get(
    url,
    {
      responseType: 'arraybuffer',
      headers: {
        'Cache-Control': 'no-cache',
      },
    }
  )
}

export default async (url: URL, keyPrefix: string) => {
  try {
    const imageData = await fetchAsArrayBuffer(url)

    const key = `${keyPrefix}/${makefileNameWithExtension(randomString(), imageData.headers['content-type'])}`

    await s3Client().putObject({
      Key: key,
      Body: imageData.data,
      Bucket: env('AWS_S3_BUCKET'),
    }).promise()

    return key
  } catch (e) {
    console.log(e)

    return null
  }
}
