import * as R from 'ramda'
import { cantMoveLastSubchapter, customException, throwException } from '../../../../utils/error/error-factory'
import { int } from '../../../../utils/number/int'
import { findOneOrFail, fixBookSubchapterOrderAfterDeleting, fixSubchapterOrderAfterAdding } from '../book-subchapter-repository'
import { setPartsById } from '../book-subchapter-service'
import orm from '../../../models'
import { fixSubchapterOrdering } from '../../book-chapters/book-chapter-service'

type Payload = {
  part: string,
}

const getLastPart = R.pipe(
  R.path(['chapter', 'subchapters']),
  R.pluck('part'),
  R.apply(Math.max)
)

const validatePartNumber = (lastPart: number, newPart: number) => {
  const isCorrectPartValue = (newPart <= lastPart && newPart > 0)

  if (!isCorrectPartValue) {
    throwException(
      customException(
        'value.out-of-bound',
        422,
        `New part has to be in the range of <1, ${lastPart}>`
      )
    )
  }
}

const getCurrentPart = R.pipe(
  R.prop('part'),
  int
)

const getSubchaptersFromPart = (part: number) => R.pipe(
  R.path(['chapter', 'subchapters']),
  R.filter(
    R.propEq('part', part)
  )
)

const validateSubchapterCanBeMoved = (subchapter) => {
  const subchapters = getSubchaptersFromPart(subchapter.part)(subchapter)

  if (subchapters.length > 1) {
    return true
  }

  if (subchapters.length === 1 && getLastPart(subchapter) === subchapter.part) {
    return true
  }

  throwException(cantMoveLastSubchapter())
}

const getNextOrderFromPart = (subchapter, part: number) => {
  return R.pipe(
    getSubchaptersFromPart(part),
    R.sortBy(
      R.prop('order')
    ),
    R.last,
    R.prop('order'),
    R.inc
  )(subchapter)
}

export default async (id: string, payload: Payload) => {
  const subchapter = await findOneOrFail({ id }, ['chapter.subchapters'])
  const lastPart = getLastPart(subchapter)
  const newPart = int(payload.part)

  if (newPart === getCurrentPart(subchapter)) {
    return subchapter
  }

  validatePartNumber(lastPart, newPart)
  validateSubchapterCanBeMoved(subchapter)

  await orm.bookshelf.transaction(async trx => {
    let newOrder = getNextOrderFromPart(subchapter, newPart)

    if (newPart > getCurrentPart(subchapter)) {
      newOrder -= 1
    }

    await fixBookSubchapterOrderAfterDeleting(subchapter.chapter_id, subchapter.order, trx)
    await fixSubchapterOrderAfterAdding(subchapter.chapter_id, newOrder, trx)
    await setPartsById(newPart, newOrder, trx)(subchapter.id)
  })

  return fixSubchapterOrdering(subchapter.chapter_id)
}
