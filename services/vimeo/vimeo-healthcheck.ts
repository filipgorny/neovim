import httpClient from './vimeo-http-client'

export default async () => {
  try {
    await httpClient.get('/')

    return true
  } catch (e: unknown) {
    return false
  }
}
