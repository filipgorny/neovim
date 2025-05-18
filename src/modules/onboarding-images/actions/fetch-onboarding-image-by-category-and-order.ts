import { findOneOrFail } from '../onboarding-images-repository'

type Payload = {
  order: number
}

export default async (category_id: string, payload: Payload) => (
  findOneOrFail({
    category_id,
    order: payload.order,
  })
)
