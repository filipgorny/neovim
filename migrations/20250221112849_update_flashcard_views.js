const tableName = 'flashcards'
const studentFlashcardStudyViewName = 'student_flashcard_study_list_view'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const studentFlashcardStudyListViewDefinitionUp = (knex) => 
  knex
    .select(
        'f.id as student_flashcard_id',
        'f.original_flashcard_id as id',
        'fl.question',
        'fl.explanation',
        'fl.question_image',
        'fl.explanation_image',
        'f.proficiency_level',
        'fl.question_html',
        'fl.explanation_html',
        'b.student_id',
        's.flashcard_study_mode as study_mode',
        'fl.code',
        'f.study_order',
        'fl.is_archived'
    ).from('student_book_content_flashcards as f')
    .leftJoin('student_book_contents as bc', 'f.content_id', 'bc.id')
    .leftJoin('student_book_subchapters as bs', 'bc.subchapter_id', 'bs.id')
    .leftJoin('student_book_chapters as bcc', 'bs.chapter_id', 'bcc.id')
    .leftJoin('student_books as b', 'bcc.book_id', 'b.id')
    .leftJoin('students as s', 'b.student_id', 's.id')
    .leftJoin('flashcards as fl', 'f.original_flashcard_id', 'fl.id')
    .distinctOn(['f.original_flashcard_id', 'b.student_id'])

const studentFlashcardStudyListViewDefinitionDown = (knex) => 
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
        'f.study_order',
        'fl.is_archived'
    ).from('student_book_content_flashcards as f')
    .leftJoin('student_book_contents as bc', 'f.content_id', 'bc.id')
    .leftJoin('student_book_subchapters as bs', 'bc.subchapter_id', 'bs.id')
    .leftJoin('student_book_chapters as bcc', 'bs.chapter_id', 'bcc.id')
    .leftJoin('student_books as b', 'bcc.book_id', 'b.id')
    .leftJoin('students as s', 'b.student_id', 's.id')
    .leftJoin('flashcards as fl', 'f.original_flashcard_id', 'fl.id')
    .distinctOn(['f.original_flashcard_id', 'b.student_id'])

const up = async knex => {
  await knex.raw(`DROP VIEW IF EXISTS ${studentFlashcardStudyViewName}`)

  await knex.raw(`CREATE VIEW ${studentFlashcardStudyViewName} AS ${studentFlashcardStudyListViewDefinitionUp(knex)}`)
}

const down = async knex => {
  await knex.raw(`DROP VIEW IF EXISTS ${studentFlashcardStudyViewName}`)

  await knex.raw(`CREATE VIEW ${studentFlashcardStudyViewName} AS ${studentFlashcardStudyListViewDefinitionDown(knex)}`)
}
