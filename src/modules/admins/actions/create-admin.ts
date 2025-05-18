import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import hashString from '../../../../utils/hashing/hash-string'
import { schema } from '../validation/schema/create-admin-schema'
import { createEmployee } from '../admin-service'

type Payload = {
  email: string,
  password: string,
  name: string
}

const formatPayload = (payload: Payload) => (
  [
    payload.email, hashString(payload.password), payload.name,
  ]
)

export default async payload => (
  R.pipe(
    validateEntityPayload(schema),
    formatPayload,
    R.apply(createEmployee)
  )(payload)
)
