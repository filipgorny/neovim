import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { S3_PREFIX_TUTOR_IMAGE } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'
import { createTutor } from '../course-tutors-service'

type Payload = {
  course_id: string
  name: string
  image_url?: string
  bio?: string
  is_active?: boolean
}

const uploadImageToS3 = async image => {
  if (!image) return undefined

  return uploadFile(image.data, image.mimetype, S3_PREFIX_TUTOR_IMAGE, true)
}

export default async (payload: Payload, files) => {
  let imageKey

  if (files?.image) {
    imageKey = await uploadImageToS3(files.image)
  }

  const imageUrl = imageKey ? generateStaticUrl(imageKey) : undefined

  return createTutor(payload.course_id, payload.name, payload.bio, payload.is_active, imageUrl)
}
