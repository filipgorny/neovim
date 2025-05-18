import R from 'ramda'
import {
  findOneOrFail,
  update,
  fixSubchapterOrderAfterAdding,
  fixBookSubchapterOrderAfterDeleting
} from '../book-subchapter-repository'
import orm from '../../../models'
import { customException, throwException } from '../../../../utils/error/error-factory'

type Payload = {
  order: number
}

const validateNewOrder = (item, newOrder: number) => {
  const currentOrder = item.order
  const subchaptersCount = R.pipe(
    R.pathOr([], ['chapter', 'subchapters']),
    R.pluck('order'),
    R.reduce(R.max, -Infinity)
  )(item)

  const isCorrectOrderValue = (
    [R.inc(currentOrder), R.dec(currentOrder)].includes(newOrder) &&
    newOrder <= subchaptersCount &&
    newOrder >= 0
  )

  if (!isCorrectOrderValue) {
    throwException(
      customException(
        'value.out-of-bound',
        422,
        `New order has to be ${currentOrder} +/- 1 and in the range of <0, ${subchaptersCount}>`
      )
    )
  }
}

export default async (subchapterId: string, payload: Payload) => {
  const item = await findOneOrFail({ id: subchapterId }, ['chapter.subchapters'])
  const newOrder = Number(payload.order)

  validateNewOrder(item, newOrder)

  return orm.bookshelf.transaction(async trx => {
    await fixBookSubchapterOrderAfterDeleting(item.chapter_id, item.order, trx)
    await fixSubchapterOrderAfterAdding(item.chapter_id, newOrder, trx)

    return update(item.id, {
      order: newOrder,
    }, trx)
  })
}
