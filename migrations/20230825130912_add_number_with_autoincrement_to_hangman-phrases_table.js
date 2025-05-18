const tableName = 'hangman_phrases'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
  await knex.schema.table(tableName, table => {
    table.integer('order').unique(); // Add the integer column
  })
  await knex.raw('CREATE SEQUENCE order_sequence');
  await knex.raw(`
    ALTER TABLE ${tableName}
    ALTER COLUMN "order" SET DEFAULT nextval('order_sequence')
  `);
}

const down = async knex => {
  await knex.schema.table(tableName, table => {
    table.dropColumn('order')
    
  })
  await knex.raw('DROP SEQUENCE order_sequence')
}
