const TABLE_NAME = 'salty_bucks_logs'
const STUDENTS_TABLE_NAME = 'students'
const BALANCE_COLUMN_NAME = 'salty_bucks_balance'

exports.up = async knex => {
    await knex.raw(`ALTER TABLE ${STUDENTS_TABLE_NAME} ADD ${BALANCE_COLUMN_NAME} INTEGER DEFAULT 0 NOT NULL CONSTRAINT positive_salty_bucks_balance CHECK(${BALANCE_COLUMN_NAME} >= 0)`);

    await createTable(knex)
}
exports.down = async knex => {
    await knex.schema.table(STUDENTS_TABLE_NAME, table => {
        table.dropColumn(BALANCE_COLUMN_NAME)
    })

    await dropTable(knex)
}

const createTable = async knex =>
  knex.schema.createTable(TABLE_NAME, table => {
    table.uuid('id').primary()

    table.uuid('student_id').notNullable()

    table.integer('amount').notNullable()

    table.text('operation_type').notNullable()

    table.text('operation_subtype').nullable()

    table.text('metadata').default("{}")

    table.text('source').notNullable()

    table.uuid('reference_id').notNullable()

    table.text('reference_type').notNullable()

    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
  })

const dropTable = knex => knex.schema.dropTable(TABLE_NAME)
