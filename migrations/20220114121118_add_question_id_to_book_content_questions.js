const BOOK_CONTENT_QUESTIONS_TABLE_NAME = 'book_content_questions'

exports.up = async knex => {
    await knex.schema.dropTable(BOOK_CONTENT_QUESTIONS_TABLE_NAME)

    await knex.schema.createTable(BOOK_CONTENT_QUESTIONS_TABLE_NAME, table => {
        table.uuid('id').primary()
        table.uuid('content_id').notNullable()
        table.uuid('question_id').notNullable()
        table.integer('order').notNullable()

        table
            .foreign('content_id')
            .references('id')
            .inTable('book_contents')

        table
            .foreign('question_id')
            .references('id')
            .inTable('questions')
    })
}

exports.down = async knex => {
    await knex.schema.dropTable(BOOK_CONTENT_QUESTIONS_TABLE_NAME)

    await knex.schema.createTable(BOOK_CONTENT_QUESTIONS_TABLE_NAME, table => {
        table.uuid('id').primary()
        table.uuid('content_id').notNullable().index()
        table.string('type').notNullable()
        table.integer('order').notNullable()
        table.string('question').nullable()
        table.text('answer_definition').notNullable()
        table.string('correct_answers').nullable()
        table.text('explanation').notNullable()
        table.integer('correct_answer_amount').defaultTo(0)
        table.integer('all_answer_amount').defaultTo(0)
        table.float('difficulty_percentage').defaultTo(0)
        table.text('answer_distribution').nullable()

        table
            .foreign('content_id')
            .references('id')
            .inTable('book_contents')
    })
}
