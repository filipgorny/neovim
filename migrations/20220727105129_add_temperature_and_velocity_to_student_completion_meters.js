const tableName = 'student_completion_meters'
const columnNameTemperature = 'temperature'
const columnNameAvgVelocity1 = 'avg_velocity_1_day_before'
const columnNameAvgVelocity2 = 'avg_velocity_2_days_before'
const columnNameAvgVelocity3 = 'avg_velocity_3_days_before'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.integer(columnNameTemperature).defaultTo(0)
    table.integer(columnNameAvgVelocity1).defaultTo(0)
    table.integer(columnNameAvgVelocity2).defaultTo(0)
    table.integer(columnNameAvgVelocity3).defaultTo(0)
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameTemperature)
    table.dropColumn(columnNameAvgVelocity1)
    table.dropColumn(columnNameAvgVelocity2)
    table.dropColumn(columnNameAvgVelocity3)
  })
