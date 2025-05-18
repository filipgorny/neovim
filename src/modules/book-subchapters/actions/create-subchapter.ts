import R from 'ramda'
import { findOneOrFail as findChapter } from '../../book-chapters/book-chapter-repository'
import { createSubchapter } from '../book-subchapter-service'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { fixSubchapterOrderAfterAdding } from '../book-subchapter-repository'
import { BookChapter } from '../../../types/book-chapter'

type PartLimit = { value: number, isLast: boolean, isFirst: boolean }

const throwValueOutOfOrderException = (prop, limits) => throwException(
  customException('value.out-of-order', 422, `Value for ${prop} should be ${limits}`)
)

const getLastSubchapter = chapter => R.pipe(
  R.prop('subchapters'),
  R.sortWith([
    R.descend(
      R.prop('order')
    ),
  ]),
  R.head,
  R.when(
    R.isNil,
    R.always({
      order: 0,
      part: 0,
    })
  )
)(chapter)

const getOrderListFromSubchapters = (partFromOrder) => R.pipe(
  R.filter(
    R.propEq('part', partFromOrder)
  ),
  R.pluck('order')
)

const isLast = (order, partFromOrder, subchapters) => R.pipe(
  getOrderListFromSubchapters(partFromOrder),
  R.reject(
    R.gte(order)
  ),
  R.isEmpty
)(subchapters)

const isFirst = (order, partFromOrder, subchapters) => R.pipe(
  getOrderListFromSubchapters(partFromOrder),
  R.reject(
    R.lte(order)
  ),
  R.isEmpty
)(subchapters)

const getPartLimit = (order: number, lastSubchapter, subchapters): PartLimit => {
  const orderSubchapter = R.find(
    R.propEq('order', order)
  )(subchapters) || { part: lastSubchapter.part }

  // @ts-ignore
  const partFromOrder = orderSubchapter.part
  const isLastInPart = isLast(order, partFromOrder, subchapters)
  const isFirstInPart = isFirst(order, partFromOrder, subchapters)

  return { value: partFromOrder, isLast: isLastInPart, isFirst: isFirstInPart }
}

const checkIsPartInRange = (partLimit: PartLimit, part: number) => (
  (partLimit.isFirst && part === partLimit.value - 1) ||
  part === partLimit.value ||
  (partLimit.isLast && part === partLimit.value + 1)
)

const getNextSubchapterOrderFromChapter = (chapter: BookChapter) => (
  R.pipe(
    R.prop('subchapters'),
    R.length,
    R.inc
  )(chapter)
)

const getSubchapterOrder = (chapter: BookChapter, order: number) => (
  order || getNextSubchapterOrderFromChapter(chapter)
)

const prepareAndSaveNewSubchapter = async payload => {
  const { chapterId, title, part } = payload
  const chapter = await findChapter({ id: chapterId }, ['subchapters'])
  const order = getSubchapterOrder(chapter, payload.order)
  const lastSubchapter = getLastSubchapter(chapter)
  const orderLimit: number = Number(lastSubchapter.order) + 1
  const partLimit: PartLimit = getPartLimit(order, lastSubchapter, chapter.subchapters)
  const isPartInRange = checkIsPartInRange(partLimit, part)

  if (!(orderLimit >= order)) {
    throwValueOutOfOrderException('order', `between <1, ${orderLimit}>`)
  }

  if (!isPartInRange) {
    throwValueOutOfOrderException('part', `between <${(
      partLimit.isFirst ? R.max(partLimit.value - 1, 1) : R.max(partLimit.value, 1)
    )}, ${(
      partLimit.isLast ? partLimit.value + 1 : partLimit.value
    )}>`)
  }

  return createSubchapter(title, order, chapter.id, part, payload.order)
}

export default async payload => (
  prepareAndSaveNewSubchapter(payload)
)
