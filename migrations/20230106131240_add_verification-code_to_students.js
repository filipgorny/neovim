const tableName = 'students'
const verificationCodeColumnName = 'verification_code'
const codeCreatedAtColumnName = 'code_created_at'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.string(verificationCodeColumnName).nullable()
    table.timestamp(codeCreatedAtColumnName).nullable()
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(verificationCodeColumnName)
    table.dropColumn(codeCreatedAtColumnName)
  })
)
