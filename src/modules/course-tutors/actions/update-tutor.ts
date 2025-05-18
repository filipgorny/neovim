import * as R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { S3_PREFIX_TUTOR_IMAGE } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'
import { patchTutor } from '../course-tutors-service'

type Payload = {
  name: string
  image_url?: string
  image?: string
  bio?: string
  is_active?: boolean
}

const uploadImageToS3 = async image => {
  if (!image) return undefined

  return uploadFile(image.data, image.mimetype, S3_PREFIX_TUTOR_IMAGE, true)
}

export default async (id: string, payload: Payload, files) => {
  if (R.has('image', files)) {
    const imageKey = await uploadImageToS3(files.image)

    if (imageKey) {
      payload.image_url = generateStaticUrl(imageKey)
    }
  }

  if (R.has('image', payload) && (R.isNil(payload.image) || payload.image === '')) {
    payload.image_url = null
  }

  return patchTutor(id, R.omit(['image'], payload))
}
