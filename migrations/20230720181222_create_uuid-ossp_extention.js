
exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
)

const down = async knex => (
  knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp";')
)
