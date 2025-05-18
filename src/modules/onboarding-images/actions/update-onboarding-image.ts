import { patch } from '../onboarding-images-repository'
import { uploadOnboardingImageToS3AndGetUrl } from './create-onboarding-image'

type Payload = {
  title?: string
}

export default async (id: string, payload: Payload, files?) => {
  let image_url
  if (files) {
    image_url = await uploadOnboardingImageToS3AndGetUrl(files.image)
  }

  return patch(id, {
    title: payload.title,
    ...(image_url ? { image_url } : {}),
  })
}
