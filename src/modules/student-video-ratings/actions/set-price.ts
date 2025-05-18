import { patchWhereName } from '../../app-settings/app-settings-repository'
import { SaltyBucksOperationSubtype } from '../../salty-bucks-log/salty-bucks-operation-subtype'

type Payload = {
  price: number
}

export default async (payload: Payload) => (
  patchWhereName(SaltyBucksOperationSubtype.ratingVideo, { value: payload.price })
)
