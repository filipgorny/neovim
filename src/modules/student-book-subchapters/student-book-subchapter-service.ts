import { create, deleteSubchapterById, findOneOrFail } from './student-book-subchapter-repository'
import { makeDTO } from './dto/student-book-subchapter-dto'
import R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import mapP from '../../../utils/function/mapp'
import { cretateBookContentsFromOriginalContents, deleteBySubchapterId } from '../student-book-contents/student-book-content-service'

export const createBookSubchapter = async (title: string, chapter_id: string, order: number, part: number, original_subchapter_id: string) => (
  create(
    makeDTO(title, chapter_id, order, part, original_subchapter_id)
  )
)

export const cretateBookSubhaptersFromOriginalSubchapters = (chapterId) => async originalSubchapter => {
  const originalContents = R.prop('contents')(originalSubchapter)
  const subchapter = await R.pipeWith(R.andThen)([
    asAsync(R.juxt([
      R.prop('title'),
      R.always(chapterId),
      R.prop('order'),
      R.prop('part'),
      R.prop('id'),
    ])),
    R.apply(createBookSubchapter),
  ])(originalSubchapter)

  await mapP(
    cretateBookContentsFromOriginalContents(subchapter.id)
  )(originalContents)

  return subchapter
}

export const deleteSubchapter = async (id: string) => {
  const subchapter = await findOneOrFail({ id })

  console.log(`delete subchapter start - ${id}`)

  await deleteBySubchapterId(subchapter.id)

  console.log(`delete subchapter end - ${id}`)

  return deleteSubchapterById(id)
}
