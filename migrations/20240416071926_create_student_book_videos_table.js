const tableName = 'student_book_videos'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').index().notNullable()
    table.uuid('video_id').index().notNullable()
    table.uuid('student_subchapter_id').index().notNullable()
    table.boolean('is_in_free_trial')

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

    table
      .foreign('student_subchapter_id')
      .references('id')
      .inTable('student_book_subchapters')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
