import { customException, throwException } from '@desmart/js-utils'
import { patchOnboardingCategory } from '../onboarding-categories-service'
import { uploadOnboardingCategoryImageToS3AndGetUrl } from './create-onboarding-category'

type Payload = {
  title: string,
  description?: string,
}

export default async (id: string, files, payload: Payload) => {
  let imageUrl
  if (files) {
    imageUrl = await uploadOnboardingCategoryImageToS3AndGetUrl(files.image)
  }

  return patchOnboardingCategory(id, {
    ...payload,
    ...(imageUrl ? { image_url: imageUrl } : {}),
  })
}
