// import orm from '../../src/models'
// import deleteStudentCourse from '../../src/modules/student-courses/actions/delete-student-course'

// const knex = orm.bookshelf.knex;

// // eslint-disable-next-line @typescript-eslint/no-floating-promises
// (async () => {
//   console.log('Deleting all student courses')

//   const studentCourseIds = await knex.from('student_courses').select('id')

//   for (const { id } of studentCourseIds) {
//     await deleteStudentCourse(id)
//   }

//   console.log('Done')

//   process.exit(0)
// })()
