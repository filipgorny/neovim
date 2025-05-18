import { updateAppSetting } from '../app-settings-service'

type Payload = {
  namespace: string,
  name: string,
  value: string,
}

export default async (id: string, payload: Payload) => (
  updateAppSetting(id, payload)
)
