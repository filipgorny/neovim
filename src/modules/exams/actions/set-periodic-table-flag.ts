import { setPeriodicTableFlag } from '../exam-service'

type Payload = {
  periodic_table_enabled: boolean,
}

export default async (id: string, payload: Payload) => (
  setPeriodicTableFlag(id, payload.periodic_table_enabled)
)
