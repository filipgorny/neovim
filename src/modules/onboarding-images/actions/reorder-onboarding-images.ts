import { findOne, findOneOrFail, patch } from '../onboarding-images-repository'

const moveUp = async (id: string) => {
  const image = await findOneOrFail({ id })
  const previousImage = await findOne({ order: image.order - 1 })

  if (!previousImage) {
    return image
  }

  return Promise.all([
    patch(image.id, { order: image.order - 1 }),
    patch(previousImage.id, { order: previousImage.order + 1 }),
  ])
}

const moveDown = async (id: string) => {
  const image = await findOneOrFail({ id })
  const nextImage = await findOne({ order: image.order + 1 })

  if (!nextImage) {
    return image
  }

  return Promise.all([
    patch(image.id, { order: image.order + 1 }),
    patch(nextImage.id, { order: nextImage.order - 1 }),
  ])
}

const REORDER = {
  up: moveUp,
  down: moveDown,
}

export default async (id: string, direction: string) => (
  REORDER[direction](id)
)
