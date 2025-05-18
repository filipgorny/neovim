// import * as R from 'ramda'
// import { findStudentByExternalId, transferProductsAndRemoveOldStudent } from '../../src/modules/students/student-service'
// import { DELETED_AT } from '@desmart/js-utils'
// import orm from '../../src/models'
// import { patch } from '../../src/modules/students/student-repository'

// const { knex } = orm.bookshelf

// const mergeStudentsAccounts = async (student) => {
//   const studentsWithTheSameEmail = await knex('students').select('id', 'email').whereRaw('email ilike ?', [student.email]).whereNull(DELETED_AT)
//   const [external_id] = await knex('students').select('external_id').whereRaw('email ilike ?', [student.email]).whereNotNull('external_id').orderBy('external_id', 'desc').limit(1)

//   if (external_id) {
//     await knex('students').where({ external_id }).update({ external_id: null })
//   }

//   if (studentsWithTheSameEmail.length > 1) {
//     const lowerCaseEmail = student.email.toLowerCase()
//     const allAreNotLowercaseEmails = R.none(
//       R.propSatisfies(R.equals(lowerCaseEmail), 'email'),
//       studentsWithTheSameEmail
//     )
//     let lowerCaseEmailStudent

//     if (allAreNotLowercaseEmails) {
//       await knex('students').where({ id: student.id }).update({ email: lowerCaseEmail })
//       student.email = lowerCaseEmail
//       lowerCaseEmailStudent = R.pick(['id', 'email'], student)
//     } else {
//       lowerCaseEmailStudent = R.find(R.propSatisfies(R.equals(lowerCaseEmail), 'email'), studentsWithTheSameEmail)
//     }

//     if (external_id) {
//       await patch(lowerCaseEmailStudent.id, { external_id: external_id })
//     }

//     const nonLowerCaseEmailStudents = R.reject(R.propSatisfies(R.equals(lowerCaseEmail), 'email'), studentsWithTheSameEmail)

//     for (const student of nonLowerCaseEmailStudents) {
//       await transferProductsAndRemoveOldStudent(student.id, lowerCaseEmailStudent.id)
//     }
//   } else if (student.email.toLowerCase() !== student.email) {
//     await knex('students').where({ id: student.id }).update({ email: student.email.toLowerCase() })
//   }

//   return studentsWithTheSameEmail.length
// }

// // eslint-disable-next-line @typescript-eslint/no-floating-promises
// (async (): Promise<void> => {
//   console.log('start merging all accounts with the same email')

//   for (let i = 0; ; i++) {
//     const [student] = await knex('students').whereNull(DELETED_AT).orderByRaw('email collate "en_US" asc').limit(1).offset(i)
//     if (!student) {
//       break
//     }
//     await mergeStudentsAccounts(student)
//   }

//   console.log('done')
//   process.exit(0)
// })()
