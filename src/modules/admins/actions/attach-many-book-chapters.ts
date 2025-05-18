import { attachAdminsToBookChapter } from '../../chapter-admins/chapter-admins-service'
import handleMultipleBookChapters from './handle-multiple-book-chapters'

export default async (id: string, payload) => (
  handleMultipleBookChapters(attachAdminsToBookChapter)(id, payload)
)
