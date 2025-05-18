const tableName = 'organization_admins'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('organization_id').index()
    table.string('email').unique().notNullable()
    table.string('password').notNullable()
    table.string('admin_role').notNullable()
    table.boolean('is_active').defaultTo(true)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('deleted_at').nullable()
    table.string('password_reset_token').nullable()
    table.timestamp('password_reset_token_created_at').nullable()
    table.string('first_name').notNullable()
    table.string('last_name').notNullable()

    table
      .foreign('organization_id')
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
