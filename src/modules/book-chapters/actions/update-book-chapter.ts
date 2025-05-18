import { updateChapter } from '../book-chapter-service'
import { findOneOrFail } from '../book-chapter-repository'

export default async (id: string, payload) => {
  const chapter = await findOneOrFail({ id })

  return updateChapter(chapter.id)({
    title: payload.title,
    image_tab_title: payload.image_tab_title,
  })
}
