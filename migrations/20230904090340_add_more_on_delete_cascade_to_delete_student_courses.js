exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const addOnDeleteCascade = async (knex, trx, tableName, columnName, foreignTableName) =>
  knex.schema
    .table(tableName, table => {
      table.dropForeign(columnName)
      table
        .foreign(columnName)
        .references('id')
        .inTable(foreignTableName)
        .onDelete('CASCADE')
    })
    .transacting(trx)

const addOnDeleteSetNull = async (knex, trx, tableName, columnName, foreignTableName) =>
    knex.schema
      .table(tableName, table => {
        table.dropForeign(columnName)
        table
          .foreign(columnName)
          .references('id')
          .inTable(foreignTableName)
          .onDelete('SET NULL')
      })
      .transacting(trx)

const removeOnDelete = async (knex, trx, tableName, columnName, foreignTableName) =>
  knex.schema
    .table(tableName, table => {
      table.dropForeign(columnName)
      table
        .foreign(columnName)
        .references('id')
        .inTable(foreignTableName)
    })
    .transacting(trx)




const up = async knex => {
  return knex.transaction(async (trx) => {
    try {
      await addOnDeleteCascade(knex, trx, 'student_completion_meters', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'stopwatches', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_attached_exams', 'course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_book_activity_timers', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_book_chapter_activity_timers', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_book_content_course_topics', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_book_contents_read', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_books', 'course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_course_activity_timers', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_course_topics', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_book_chapters', 'book_id', 'student_books')
      await addOnDeleteCascade(knex, trx, 'student_book_subchapters', 'chapter_id', 'student_book_chapters')
      await addOnDeleteCascade(knex, trx, 'student_book_chapter_images', 'chapter_id', 'student_book_chapters')
      await addOnDeleteCascade(knex, trx, 'student_book_contents', 'subchapter_id', 'student_book_subchapters')
      await addOnDeleteCascade(knex, trx, 'student_book_content_attachments', 'content_id', 'student_book_contents')
      await addOnDeleteCascade(knex, trx, 'student_book_content_resources', 'content_id', 'student_book_contents')
      await addOnDeleteCascade(knex, trx, 'student_book_content_questions', 'content_id', 'student_book_contents')
      await addOnDeleteCascade(knex, trx, 'student_book_content_images', 'content_id', 'student_book_contents')
      await addOnDeleteCascade(knex, trx, 'student_book_content_comments', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_book_subchapter_notes', 'subchapter_id', 'student_book_subchapters')
      await addOnDeleteCascade(knex, trx, 'flashcard_activity_timers', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_flashcard_boxes', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_flashcard_archive', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'video_activity_timers', 'student_course_id', 'student_courses')
      await addOnDeleteCascade(knex, trx, 'student_pin_variants', 'student_book_id', 'student_books')
      await addOnDeleteCascade(knex, trx, 'student_book_content_pins', 'content_id', 'student_book_contents')
      await addOnDeleteCascade(knex, trx, 'flashcard_activity_timers', 'student_book_id', 'student_books')
      await addOnDeleteCascade(knex, trx, 'student_book_activity_timers', 'student_book_id', 'student_books')
      await addOnDeleteCascade(knex, trx, 'student_book_chapter_activity_timers', 'student_book_id', 'student_books')

      await trx.commit()
    } catch (err) {
      await trx.rollback()
      throw err
    }
  })
}

const down = async knex => {
  return knex.transaction(async (trx) => {
    try {
      await removeOnDelete(knex, trx, 'student_completion_meters', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'stopwatches', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_attached_exams', 'course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_book_activity_timers', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_book_chapter_activity_timers', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_book_content_course_topics', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_book_contents_read', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_books', 'course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_course_activity_timers', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_course_topics', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_book_chapters', 'book_id', 'student_books')
      await removeOnDelete(knex, trx, 'student_book_subchapters', 'chapter_id', 'student_book_chapters')
      await removeOnDelete(knex, trx, 'student_book_chapter_images', 'chapter_id', 'student_book_chapters')
      await removeOnDelete(knex, trx, 'student_book_contents', 'subchapter_id', 'student_book_subchapters')
      await removeOnDelete(knex, trx, 'student_book_content_attachments', 'content_id', 'student_book_contents')
      await removeOnDelete(knex, trx, 'student_book_content_resources', 'content_id', 'student_book_contents')
      await removeOnDelete(knex, trx, 'student_book_content_questions', 'content_id', 'student_book_contents')
      await removeOnDelete(knex, trx, 'student_book_content_images', 'content_id', 'student_book_contents')
      await removeOnDelete(knex, trx, 'student_book_content_comments', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_book_subchapter_notes', 'subchapter_id', 'student_book_subchapters')
      await removeOnDelete(knex, trx, 'flashcard_activity_timers', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_flashcard_boxes', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_flashcard_archive', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'video_activity_timers', 'student_course_id', 'student_courses')
      await removeOnDelete(knex, trx, 'student_pin_variants', 'student_book_id', 'student_books')
      await removeOnDelete(knex, trx, 'student_book_content_pins', 'content_id', 'student_book_contents')
      await removeOnDelete(knex, trx, 'flashcard_activity_timers', 'student_book_id', 'student_books')
      await removeOnDelete(knex, trx, 'student_book_activity_timers', 'student_book_id', 'student_books')
      await removeOnDelete(knex, trx, 'student_book_chapter_activity_timers', 'student_book_id', 'student_books')

      await trx.commit()
    } catch (err) {
      await trx.rollback()
      throw err
    }
  })
}
