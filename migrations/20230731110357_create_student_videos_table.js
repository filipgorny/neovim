const tableName = 'student_videos'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id')
    table.uuid('video_id')
    table.text('delta_object')
    table.boolean('is_read')
    
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

const dropTable = knex => knex.schema.dropTable(tableName)
