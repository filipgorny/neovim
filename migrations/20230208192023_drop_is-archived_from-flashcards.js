const tableName = 'flashcards'
const columnName = 'is_archived'
const flashcardListViewName = 'flashcards_list_view'
const studentFlashcardStudyViewName = 'student_flashcard_study_list_view'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const studentFlashcardStudyListViewDefinition = (knex) => 
  knex
    .select(
        'f.id as student_flashcard_id',
        'f.original_flashcard_id as id',
        'f.question',
        'f.explanation',
        'f.question_image',
        'f.explanation_image',
        'f.proficiency_level',
        'f.question_html',
        'f.explanation_html',
        'b.student_id',
        's.flashcard_study_mode as study_mode',
        'fl.code',
        'f.study_order'
    ).from('student_book_content_flashcards as f')
    .leftJoin('student_book_contents as bc', 'f.content_id', 'bc.id')
    .leftJoin('student_book_subchapters as bs', 'bc.subchapter_id', 'bs.id')
    .leftJoin('student_book_chapters as bcc', 'bs.chapter_id', 'bcc.id')
    .leftJoin('student_books as b', 'bcc.book_id', 'b.id')
    .leftJoin('students as s', 'b.student_id', 's.id')
    .leftJoin('flashcards as fl', 'f.original_flashcard_id', 'fl.id')
    .distinctOn(['f.original_flashcard_id', 'b.student_id'])

const flashcardsListViewDefinition = knex =>
  knex
    .select(
        'f.*',
        knex.raw('b.id as book_id'),
        knex.raw('b.title as book_title'),
        knex.raw('bcc.id as chapter_id'),
        knex.raw('bcc."order" as chapter_order'),
        'bs.part',
        knex.raw('bs.id as subchapter_id'),
        knex.raw('bs."order" as subchapter_order'),
        knex.raw('bs.title as subchapter_title'),
        knex.raw('bc.id as content_id'),
        knex.raw('bc."order" as content_order'),
    ).from('flashcards AS f')
    .leftJoin('book_content_flashcards as bcf', 'bcf.flashcard_id', 'f.id')
    .leftJoin('book_contents as bc', 'bcf.content_id', 'bc.id')
    .leftJoin('book_subchapters as bs', 'bc.subchapter_id', 'bs.id')
    .leftJoin('book_chapters as bcc', 'bs.chapter_id', 'bcc.id')
    .leftJoin('books as b', 'bcc.book_id', 'b.id')
    .whereRaw('f.deleted_at is null')
    .distinctOn('f.id')


const up = async knex => {
  await knex.raw(`DROP VIEW IF EXISTS ${flashcardListViewName}`)
  await knex.raw(`DROP VIEW IF EXISTS ${studentFlashcardStudyViewName}`)

  await knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })

  await knex.raw(`CREATE VIEW ${flashcardListViewName} AS ${flashcardsListViewDefinition(knex)}`)
  await knex.raw(`CREATE VIEW ${studentFlashcardStudyViewName} AS ${studentFlashcardStudyListViewDefinition(knex)}`)
}

const down = async knex => {
  await knex.raw(`DROP VIEW IF EXISTS ${flashcardListViewName}`)
  await knex.raw(`DROP VIEW IF EXISTS ${studentFlashcardStudyViewName}`)

  await knex.schema.table(tableName, table => {
    table.boolean(columnName).defaultTo(false)
  })

  await knex.raw(`CREATE VIEW ${flashcardListViewName} AS ${flashcardsListViewDefinition(knex)}`)
  await knex.raw(`CREATE VIEW ${studentFlashcardStudyViewName} AS ${studentFlashcardStudyListViewDefinition(knex)}`)
}
