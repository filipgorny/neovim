import { getGladiatorsGameApiClient } from '../../../../services/game-http-client/client'

export default async (request, namespace: string) => {
  const response = await getGladiatorsGameApiClient(request)
    .get(`/app-settings/namespace/${namespace}`)

  return response.data
}
