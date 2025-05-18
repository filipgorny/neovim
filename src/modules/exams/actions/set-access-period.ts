import { setAccessPeriod } from '../exam-service'

export default async (id: string, payload, user) => {
  const { access_period } = payload

  return setAccessPeriod(id)(access_period, user.id)
}
