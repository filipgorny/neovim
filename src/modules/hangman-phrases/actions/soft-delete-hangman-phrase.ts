import { patch } from '../hangman-phrases-repository'

export default async (id: string) => (
  patch(id, { deleted_at: new Date() })
)
