import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import {
  findOneOrFail,
  patch,
  fixAttachmentOrderAfterAdding,
  fixAttachmentOrderAfterDeleting
} from '../book-content-attachment-repository'
import { schema } from '../validation/schema/move-attachment-schema'
import orm from '../../../models'
import R from 'ramda'
import { customException, throwException } from '../../../../utils/error/error-factory'

type MoveBookContentPayload = {
  order: number | number
}

const validateNewOrder = (attachment, newOrder: number) => {
  const currentOrder = attachment.order
  const attachmentsCount = R.pipe(
    R.pathOr([], ['content', 'attachments']),
    R.pluck('order'),
    R.reduce(R.max, -Infinity)
  )(attachment)

  const isCorrectOrderValue = (
    [R.inc(currentOrder), R.dec(currentOrder)].includes(newOrder) &&
    newOrder <= attachmentsCount &&
    newOrder >= 0
  )

  if (!isCorrectOrderValue) {
    throwException(
      customException(
        'value.out-of-bound',
        422,
        `New order has to be ${currentOrder} +/- 1 and in the range of <0, ${attachmentsCount}>`
      )
    )
  }
}

export default async (contentId: string, payload: MoveBookContentPayload) => {
  validateEntityPayload(schema)(payload)

  const attachment = await findOneOrFail({ id: contentId }, ['content.attachments'])
  const newOrder = Number(payload.order)

  validateNewOrder(attachment, newOrder)

  return orm.bookshelf.transaction(async trx => {
    await fixAttachmentOrderAfterDeleting(attachment.content_id, attachment.order, trx)
    await fixAttachmentOrderAfterAdding(attachment.content_id, newOrder, trx)

    return patch(attachment.id, {
      order: newOrder,
    }, trx)
  })
}
