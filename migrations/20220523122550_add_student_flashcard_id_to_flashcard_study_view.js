exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const viewName = 'student_flashcard_study_list_view'

const up = async (knex) => {
  const studentFlashcardStudyListViewDefinition = knex
  .select(
    'f.id as student_flashcard_id',
    'f.original_flashcard_id as id',
    'f.question',
    'f.explanation',
    'f.question_image',
    'f.explanation_image',
    'f.proficiency_level',
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

  await knex.raw(`DROP VIEW IF EXISTS ${viewName}`)

  return knex.raw(`CREATE VIEW ${viewName} AS ${studentFlashcardStudyListViewDefinition}`)
}

const down = async (knex) => {
  const studentFlashcardStudyListViewDefinition = knex
  .select(
    'f.original_flashcard_id as id',
    'f.question',
    'f.explanation',
    'f.question_image',
    'f.explanation_image',
    'f.proficiency_level',
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

  await knex.raw(`DROP VIEW IF EXISTS ${viewName}`)

  return knex.raw(`CREATE VIEW ${viewName} AS ${studentFlashcardStudyListViewDefinition}`)
}
