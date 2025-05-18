import { setGoogleFormUrl } from '../exam-service'

type Payload = {
  google_form_url: string,
}

export default async (id: string, payload: Payload) => (
  setGoogleFormUrl(id)(payload.google_form_url)
)
