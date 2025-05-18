import mapP from "../utils/function/mapp";

const TABLE_NAMES = ['books', 'student_books']
const COLUMN_NAME = 'image_url'

export async function up(knex) {
    await mapP((tableName) => knex.schema.table(tableName, table => {
        table.text(COLUMN_NAME).nullable()
    }))(TABLE_NAMES)
}

export async function down(knex) {
    await mapP((tableName) => knex.schema.table(tableName, table => {
        table.dropColumn(COLUMN_NAME)
    }))(TABLE_NAMES)
}
