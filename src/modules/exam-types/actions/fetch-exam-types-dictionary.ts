import R from 'ramda'
import { getExamTypesDictionary } from '../exam-type-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { UserRoleEnum } from '../../../middleware/user-roles'
import { getUniqueStudentExamTypes } from '../../student-exams/student-exam-repository'

const isAdmin = instance => () => R.equals(instance.get('role'), UserRoleEnum.admin)

const fetchAdminDictionary = () => R.pipeWith(R.andThen)([
  getExamTypesDictionary,
  R.prop('data'),
  collectionToJson,
  R.pluck('type'),
])(true)

const fetchStudentDictionary = (studentId: string) => R.pipeWith(R.andThen)([
  getUniqueStudentExamTypes,
  R.prop('data'),
  collectionToJson,
  R.pluck('type'),
  R.pluck('type'),
  R.uniq,
])(studentId)

export default async instance => R.ifElse(
  isAdmin(instance),
  fetchAdminDictionary,
  fetchStudentDictionary
)(instance.id)
