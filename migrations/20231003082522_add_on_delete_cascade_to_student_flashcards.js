exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const addOnDeleteCascade = async (knex, trx, tableName, columnName, foreignTableName) =>
  knex.schema
    .table(tableName, table => {
      table.dropForeign(columnName)
      table
        .foreign(columnName)
        .references('id')
        .inTable(foreignTableName)
        .onDelete('CASCADE')
    })
    .transacting(trx)

const addOnDeleteSetNull = async (knex, trx, tableName, columnName, foreignTableName) =>
    knex.schema
      .table(tableName, table => {
        table.dropForeign(columnName)
        table
          .foreign(columnName)
          .references('id')
          .inTable(foreignTableName)
          .onDelete('SET NULL')
      })
      .transacting(trx)

const removeOnDelete = async (knex, trx, tableName, columnName, foreignTableName) =>
  knex.schema
    .table(tableName, table => {
      table.dropForeign(columnName)
      table
        .foreign(columnName)
        .references('id')
        .inTable(foreignTableName)
    })
    .transacting(trx)




const up = async knex => {
  return knex.transaction(async (trx) => {
    try {
      await addOnDeleteCascade(knex, trx, 'student_book_content_flashcards', 'content_id', 'student_book_contents')

      await trx.commit()
    } catch (err) {
      await trx.rollback()
      throw err
    }
  })
}

const down = async knex => {
  return knex.transaction(async (trx) => {
    try {
      await removeOnDelete(knex, trx, 'student_book_content_flashcards', 'content_id', 'student_book_contents')

      await trx.commit()
    } catch (err) {
      await trx.rollback()
      throw err
    }
  })
}
