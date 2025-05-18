const tableName = 'onboarding_images'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('category_id').notNullable()
    table.string('title').notNullable()
    table.text('image_url').notNullable()
    table.integer('order').notNullable()

    table
      .foreign('category_id')
      .references('id')
      .inTable('onboarding_categories')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
