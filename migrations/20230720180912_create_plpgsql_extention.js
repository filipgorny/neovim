
exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.raw('CREATE EXTENSION IF NOT EXISTS plpgsql;')
)

const down = async knex => {}
