const tableName = 'book_content_questions'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('content_id').notNullable().index()
    table.string('type').notNullable()
    table.integer('order').notNullable()
    table.string('details').notNullable()
    table.text('answer_definition').notNullable()
    table.string('correct_answers').notNullable()
    table.text('explanation').notNullable()
    table.integer('correct_answer_amount').defaultTo(0)
    table.integer('all_answer_amount').defaultTo(0)
    table.float('difficulty_percentage').defaultTo(0)
    table.text('answer_distribution').notNullable()

    table
    .foreign('content_id')
    .references('id')
    .inTable('book_contents')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
