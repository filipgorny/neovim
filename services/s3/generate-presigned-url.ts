import { s3Client } from './s3-client'

const URL_EXPIRES_IN = 86400 // 24h in seconds (60 * 60 * 24)

export default key => {
  try {
    return key
      ? s3Client().getSignedUrl('getObject', {
        Key: key,
        Expires: URL_EXPIRES_IN,
      })
      : undefined
  } catch (e) {
    console.log(e)
  }
}
