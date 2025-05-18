const tableName = 'students'

const columnNameTS = 'target_score'
const columnNameSectionChemPhys = 'target_score_section_chem_phys'
const columnNameSectionCars = 'target_score_section_cars'
const columnNameSectionBiology = 'target_score_section_biology'
const columnNameSectionPsychSoc = 'target_score_section_psych_soc'
const columnPTSName = 'projected_target_score'
const columnNameSectionChemPhysPTS = 'projected_target_score_section_chem_phys'
const columnNameSectionCarsPTS = 'projected_target_score_section_cars'
const columnNameSectionBiologyPTS = 'projected_target_score_section_biology'
const columnNameSectionPsychSocPTS = 'projected_target_score_section_psych_soc'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn('external_id')
    table.dropColumn(columnNameTS)
    table.dropColumn(columnNameSectionChemPhys)
    table.dropColumn(columnNameSectionCars)
    table.dropColumn(columnNameSectionBiology)
    table.dropColumn(columnNameSectionPsychSoc)
    table.dropColumn(columnPTSName)
    table.dropColumn(columnNameSectionChemPhysPTS)
    table.dropColumn(columnNameSectionCarsPTS)
    table.dropColumn(columnNameSectionBiologyPTS)
    table.dropColumn(columnNameSectionPsychSocPTS)
  })
)

const down = (knex) => (
  knex.schema.table(tableName, table => {
    table.string('external_id').nullable().index().unique()
    table.integer(columnNameTS)
    table.integer(columnNameSectionChemPhys)
    table.integer(columnNameSectionCars)
    table.integer(columnNameSectionBiology)
    table.integer(columnNameSectionPsychSoc)
    table.integer(columnPTSName)
    table.integer(columnNameSectionChemPhysPTS)
    table.integer(columnNameSectionCarsPTS)
    table.integer(columnNameSectionBiologyPTS)
    table.integer(columnNameSectionPsychSocPTS)
  })
)
