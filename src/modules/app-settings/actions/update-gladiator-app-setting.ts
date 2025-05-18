import { getGladiatorsGameApiClient } from '../../../../services/game-http-client/client'

type Payload = {
  namespace: string,
  name: string,
  value: string,
}

export default async (id: string, request, payload: Payload) => {
  const response = await getGladiatorsGameApiClient(request)
    .patch(`/app-settings/${id}`, {
      ...payload,
    })

  return response.data
}
