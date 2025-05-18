import * as R from 'ramda'
import { createOnboardingCategory } from '../onboarding-categories-service'
import { find } from '../onboarding-categories-repository'
import { customException, int, throwException } from '@desmart/js-utils'
import { S3_PREFIX_ONBOARDING_CATEGORY } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'

type Payload = {
  title: string,
  description?: string,
}

const countCategories = async () => R.pipeWith(R.andThen)([
  async () => find({ limit: { page: 1, take: 100 }, order: { dir: 'asc', by: 'order' } }),
  R.prop('meta'),
  R.prop('recordsTotal'),
  int,
])(true)

const getNextOrder = async () => {
  const categoryCount = await countCategories()

  return categoryCount + 1
}

const uploadFileToS3AndGetUrl = async (image) => {
  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_ONBOARDING_CATEGORY, true)

  return key
}

export default async (files, payload: Payload) => {
  if (!files) {
    throwException(customException('onboarding-categories.image.not-found', 404, 'No image was provided'))
  }

  const imageUrl = await uploadFileToS3AndGetUrl(files.image)
  const order = await getNextOrder()

  return createOnboardingCategory(payload, order, imageUrl)
}

export { uploadFileToS3AndGetUrl as uploadOnboardingCategoryImageToS3AndGetUrl }
