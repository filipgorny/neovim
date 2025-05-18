const TABLE_NAME = 'questions'

exports.up = async knex => {
    await knex(TABLE_NAME).truncate();

    await knex.schema.table(TABLE_NAME, table => {
        table.dropColumns('question_content', 'explanation', 'chapter', 'correct_answer', 'question_type')

        table.text('type').notNullable()

        table.text('correct_answers').notNullable()

        table.text('question_content_raw').notNullable()

        table.text('question_content_delta_object').notNullable()

        table.text('explanation_raw').notNullable()

        table.text('explanation_delta_object').notNullable()

        table.timestamp('deleted_at').nullable()
    })
};

exports.down = async knex => {
    await knex(TABLE_NAME).truncate();

    await knex.schema.table(TABLE_NAME, table => {
        table.dropColumns(
            'type',
            'correct_answers',
            'question_content_raw',
            'question_content_delta_object',
            'explanation_raw',
            'explanation_delta_object',
            'deleted_at'
        )

        table.text('question_content').notNullable()

        table.text('explanation').notNullable()

        table.string('correct_answer').notNullable()

        table.string('question_type').notNullable()

        table.text('chapter')
    })
};
