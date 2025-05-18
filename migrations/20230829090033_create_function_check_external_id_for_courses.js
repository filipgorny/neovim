const tableName = 'courses'
const columnName = 'external_id'

exports.up = async (knex) => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.raw(`
    CREATE FUNCTION check_external_id(id TEXT, external_id TEXT)
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN id = any(string_to_array(external_id, ','));
    END;
    $$ LANGUAGE plpgsql;
  `)
)

const down = async knex => (
  knex.raw('DROP FUNCTION check_external_id;')
)
