const tableName = 'students'
const videoColumnName = 'video_bg_music_enabled'
const cqColumnName = 'cq_animations_enabled'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.boolean(videoColumnName).defaultTo(true)
    table.boolean(cqColumnName).defaultTo(true)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(videoColumnName)
    table.dropColumn(cqColumnName)
  })
)
