const tableName = 'admins'
const columnNameGlossary = 'can_manage_glossary'
const columnNameFlashcards = 'can_manage_flashcards'
const columnNameVideos = 'can_manage_videos'
const columnNameContentQuestions = 'can_manage_content_questions'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnNameGlossary).notNullable().defaultTo(false)
    table.boolean(columnNameFlashcards).notNullable().defaultTo(false)
    table.boolean(columnNameVideos).notNullable().defaultTo(false)
    table.boolean(columnNameContentQuestions).notNullable().defaultTo(false)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameGlossary)
    table.dropColumn(columnNameFlashcards)
    table.dropColumn(columnNameVideos)
    table.dropColumn(columnNameContentQuestions)
  })
)
