import * as R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { findOneOrFail as findContent } from '../../student-book-contents/student-book-content-repository'
import { find as findPinVariants } from '../../student-pin-variants/student-pin-variants-repository'
import { validateContentBelongsToStudent } from '../validation/validate-content-belongs-to-student'

const appendPinVariant = variants => note => {
  const pinVariant = R.find(
    R.propEq('variant', note.variant)
  )(variants)

  return R.mergeLeft({ pinVariant })(note)
}

const findStudentPinVariants = async (student, content) => (
  R.pipeWith(R.andThen)([
    async () => findPinVariants({ limit: { page: 1, take: 10 }, order: { by: 'variant', dir: 'asc' } }, {
      student_id: student.id,
      student_book_id: content.subchapter.chapter.book.id,
    }),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

export default async (student, content_id, query) => {
  const content = await findContent({ id: content_id }, ['subchapter.chapter.book', 'pinNotes'])
  const variants = await findStudentPinVariants(student, content)

  validateContentBelongsToStudent(student.id)(content)

  return R.pipe(
    R.propOr([], 'pinNotes'),
    R.map(
      appendPinVariant(variants)
    )
  )(content)
}
