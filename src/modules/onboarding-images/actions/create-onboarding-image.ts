import { customException, throwException } from '@desmart/js-utils'
import { S3_PREFIX_ONBOARDING } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'
import OnboardingImageDTO from '../dto/onboarding-image'
import { create } from '../onboarding-images-repository'
import { nextCategoryImageOrder } from '../onboarding-images-service'

const uploadFileToS3AndGetUrl = async (image) => {
  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_ONBOARDING, true)

  return key
}

type Payload = Omit<OnboardingImageDTO, 'image_url' | 'order'>

export default async (files, payload: Payload) => {
  if (!files) {
    throwException(customException('onboarding-images.image.not-found', 404, 'No image was provided'))
  }

  const imageUrl = await uploadFileToS3AndGetUrl(files.image)
  const order = await nextCategoryImageOrder(payload.category_id)

  return create({
    ...payload,
    order,
    image_url: imageUrl,
  })
}

export { uploadFileToS3AndGetUrl as uploadOnboardingImageToS3AndGetUrl }
