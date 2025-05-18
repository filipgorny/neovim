const tableName = 'student_video_ratings'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = async knex => {
  await knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.uuid('video_id').notNullable()
    table.dateTime('created_at').notNullable()
    table.integer('rating').notNullable()

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')

    table
      .foreign('video_id')
      .references('id')
      .inTable('videos')
      .onDelete('CASCADE')
  })
}

const dropTable = knex => knex.schema.dropTable(tableName)
