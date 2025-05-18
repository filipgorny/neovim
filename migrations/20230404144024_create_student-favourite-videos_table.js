const tableName = 'student_favourite_videos'
const indexName = 'student_favourite_videos_student_id_resource_id_unique'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = async knex => {
  await knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.uuid('resource_id').notNullable()
    table.uuid('video_id').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE')

    table
      .foreign('resource_id')
      .references('id')
      .inTable('student_book_content_resources')
      .onDelete('CASCADE')

    table
      .foreign('video_id')
      .references('id')
      .inTable('videos')
      .onDelete('CASCADE')
      
  })

  await knex.schema.raw(`CREATE UNIQUE INDEX "${indexName}" ON "${tableName}" ("student_id", "resource_id")`)
}

const dropTable = knex => knex.schema.dropTable(tableName)
