import { s3Client } from './s3-client'

export default async () => {
  try {
    await s3Client().headBucket().promise()

    return true
  } catch (e: unknown) {
    return false
  }
}
