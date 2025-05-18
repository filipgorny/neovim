const tableName = 'questions'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.text('question_content').notNullable()
    table.text('answer_definition').notNullable()
    table.text('explanation').notNullable()
    table.text('chapter')
    table.string('question_type').notNullable()
    table.string('correct_answer').notNullable()
  })

const dropTable = knex => knex.schema.dropTable(tableName)
