const studentExamSectionsTable = 'student_exam_sections'
const examSectionsTable = 'exam_sections'
const columnName = 'scaled_score_template_id'
exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
    await knex.schema.table(studentExamSectionsTable, table => {
        table.dropColumn(columnName)
    })

    await knex.schema.table(examSectionsTable, table => {
        table.dropColumn(columnName)
    })
}


const down = async knex => {
    await knex.schema.table(studentExamSectionsTable, table => {
        table.uuid(columnName).nullable()

        table
          .foreign('scaled_score_template_id')
          .references('id')
          .inTable('scaled_score_templates')
    })

    await knex.schema.table(examSectionsTable, table => {
        table.uuid(columnName).nullable()

        table
          .foreign('scaled_score_template_id')
          .references('id')
          .inTable('scaled_score_templates')
    })
}
