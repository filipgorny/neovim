import { attachAdminsToBookChapter } from '../../chapter-admins/chapter-admins-service'
import handleMultipleAdmins from './handle-multiple-admins'

export default async (id: string, payload) => (
  handleMultipleAdmins(attachAdminsToBookChapter)(id, payload)
)
