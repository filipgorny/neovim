const tableName = 'book_courses'
const newTableName = 'courses'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex => knex.schema.renameTable(tableName, newTableName)

const dropTable = knex => knex.schema.renameTable(newTableName, tableName)
