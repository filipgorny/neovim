import { patchErrata } from '../exam-erratas-service'

export default async (id: string, payload: {}) => (
  patchErrata(id, payload)
)
