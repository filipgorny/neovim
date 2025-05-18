import { patch } from '../notifications-repository'

export default async (id: string) => (
  patch(id, { deleted_at: new Date() })
)
