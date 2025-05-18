import orm from '../../../models'
import mapP from '../../../../utils/function/mapp'
import deleteQuestion from './delete-question'

const bookshelf = orm.bookshelf

export type Payload = {
  ids: string[]
}

export default async (request, payload: Payload, query) => {
  const { ids } = payload

  let result = []

  await bookshelf.transaction(async trx => {
    try {
      result = await mapP(async id => deleteQuestion(request, id, query, trx))(ids)

      await trx.commit()
    } catch (err) {
      await trx.rollback()
      throw err
    }
  })

  return result
}
