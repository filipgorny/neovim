import { Knex } from "knex";
const tableName = 'book_subchapters'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.timestamps()
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropTimestamps()
  })
  