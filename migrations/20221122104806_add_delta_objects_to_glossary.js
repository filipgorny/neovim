
const tableName = 'glossary'

const columnNamePhrase = 'phrase'
const columnNamePhraseRaw = 'phrase_raw'
const columnNameExplanation = 'explanation'
const columnNameExplanationRaw = 'explanation_raw'
const columnNamePhraseDeltaObject = 'phrase_delta_object'
const columnNameExplanationDeltaObject = 'explanation_delta_object'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.renameColumn(columnNamePhrase, columnNamePhraseRaw)
    table.renameColumn(columnNameExplanation, columnNameExplanationRaw)
    table.text(columnNamePhraseDeltaObject).notNullable().defaultTo('')
    table.text(columnNameExplanationDeltaObject).notNullable().defaultTo('')
    
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.renameColumn(columnNamePhraseRaw, columnNamePhrase)
    table.renameColumn(columnNameExplanationRaw, columnNameExplanation)
    table.dropColumn(columnNamePhraseDeltaObject)
    table.dropColumn(columnNameExplanationDeltaObject)
  })
