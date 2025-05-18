const tableName = 'scaled_scores'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('template_id')
    table.integer('correct_answer_amount').notNullable()
    table.integer('scaled_score').notNullable()
    table.string('percentile_rank').notNullable()

    table
      .foreign('template_id')
      .references('id')
      .inTable('scaled_score_templates')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
