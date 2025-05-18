import orm from '../../models'

const { knex } = orm.bookshelf

export const shiftOrdersDown = async (phrase_id: string, order: number) => (
  knex.raw('update hangman_hints set "order" = "order" - 1 where phrase_id = ? and "order" > ?', [phrase_id, order])
)
