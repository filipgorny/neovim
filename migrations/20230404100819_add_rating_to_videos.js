const tableName = 'videos'
const ratingColumnName = 'rating'
const fakeRatingColumnName = 'fake_rating'
const usefakeRatingColumnName = 'use_fake_rating'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.decimal(ratingColumnName)
    table.decimal(fakeRatingColumnName)
    table.boolean(usefakeRatingColumnName).notNullable().defaultTo(false)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(ratingColumnName)
    table.dropColumn(fakeRatingColumnName)
    table.dropColumn(usefakeRatingColumnName)
  })
)
