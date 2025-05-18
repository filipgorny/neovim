const tableName = 'students'
const columnNameTS = 'target_score'
const columnNameSectionChemPhys = 'target_score_section_chem_phys'
const columnNameSectionCars = 'target_score_section_cars'
const columnNameSectionBiology = 'target_score_section_biology'
const columnNameSectionPsychSoc = 'target_score_section_psych_soc'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.integer(columnNameTS)
    table.integer(columnNameSectionChemPhys)
    table.integer(columnNameSectionCars)
    table.integer(columnNameSectionBiology)
    table.integer(columnNameSectionPsychSoc)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameTS)
    table.dropColumn(columnNameSectionChemPhys)
    table.dropColumn(columnNameSectionCars)
    table.dropColumn(columnNameSectionBiology)
    table.dropColumn(columnNameSectionPsychSoc)
  })
)
