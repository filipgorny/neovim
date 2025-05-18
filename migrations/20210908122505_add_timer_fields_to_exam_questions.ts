const tableName_20210908122505 = 'exam_questions'

const columnCheckingSum = 'checking_sum'
const columnCheckingDivisor = 'checking_divisor'
const columnCheckingAvg = 'checking_avg'

const columnReadingSum = 'reading_sum'
const columnReadingDivisor = 'reading_divisor'
const columnReadingAvg = 'reading_avg'

const columnWorkingSum = 'working_sum'
const columnWorkingDivisor = 'working_divisor'
const columnWorkingAvg = 'working_avg'

exports.up = async knex => addTimerColumns(knex)
exports.down = async knex => dropTimerColumn(knex)

const addTimerColumns = (knex) => (
  knex.schema.table(tableName_20210908122505, table => {
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

const dropTimerColumn = (knex) => (
  knex.schema.table(tableName_20210908122505, table => {
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
