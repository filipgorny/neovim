const tableName = 'student_completion_meters'
const columnNameWasInTheGreen1 = 'was_in_the_green_1_day_before'
const columnNameWasInTheGreen2 = 'was_in_the_green_2_days_before'
const columnNameWasInTheGreen3 = 'was_in_the_green_3_days_before'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.boolean(columnNameWasInTheGreen1).defaultTo(false)
    table.boolean(columnNameWasInTheGreen2).defaultTo(false)
    table.boolean(columnNameWasInTheGreen3).defaultTo(false)
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameWasInTheGreen1)
    table.dropColumn(columnNameWasInTheGreen2)
    table.dropColumn(columnNameWasInTheGreen3)
  })
