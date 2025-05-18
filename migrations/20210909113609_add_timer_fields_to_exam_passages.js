const tableName = 'exam_passages'

const columnCheckingSum = 'checking_sum'
const columnCheckingDivisor = 'checking_divisor'
const columnCheckingAvg = 'checking_avg'

const columnReadingSum = 'reading_sum'
const columnReadingDivisor = 'reading_divisor'
const columnReadingAvg = 'reading_avg'

const columnWorkingSum = 'working_sum'
const columnWorkingDivisor = 'working_divisor'
const columnWorkingAvg = 'working_avg'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.integer(columnCheckingSum).nullable()
    table.integer(columnCheckingDivisor).nullable()
    table.decimal(columnCheckingAvg).nullable()

    table.integer(columnReadingSum).nullable()
    table.integer(columnReadingDivisor).nullable()
    table.decimal(columnReadingAvg).nullable()

    table.integer(columnWorkingSum).nullable()
    table.integer(columnWorkingDivisor).nullable()
    table.decimal(columnWorkingAvg).nullable()
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnCheckingAvg)
    table.dropColumn(columnCheckingDivisor)
    table.dropColumn(columnCheckingSum)
    
    table.dropColumn(columnReadingAvg)
    table.dropColumn(columnReadingDivisor)
    table.dropColumn(columnReadingSum)

    table.dropColumn(columnWorkingAvg)
    table.dropColumn(columnWorkingDivisor)
    table.dropColumn(columnWorkingSum)
  })
)
