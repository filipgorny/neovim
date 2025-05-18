export default studentId => async (knex, qs) => {
  return knex('student_exams AS se')
    .where('student_id', studentId)
    // following lines where commented to exclude unavailable exams from a student list
    // .union(
    //   knex.raw(`
    //     select count(e.id) from exams e
    //     where id not in (
    //       select exam_id from student_exams se2 where student_id = '${studentId}'
    //     )
    //     and deleted_at is null
    //   `)
    // )
    .countDistinct('se.id')
}
