import R from 'ramda'
import { getExamSubtypesDictionary } from '../exam-type-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { UserRoleEnum } from '../../../middleware/user-roles'
import { getUniqueStudentExamTypes } from '../../student-exams/student-exam-repository'

const isAdmin = instance => () => R.equals(instance.get('role'), UserRoleEnum.admin)

const fetchAdminDictionary = (type: string) => R.pipeWith(R.andThen)([
  getExamSubtypesDictionary,
  R.prop('data'),
  collectionToJson,
  R.pluck('subtype'),
])(type)

const fetchStudentDictionary = (studentId: string) => type => R.pipeWith(R.andThen)([
  getUniqueStudentExamTypes,
  R.prop('data'),
  collectionToJson,
  R.pluck('type'),
  R.filter(
    R.propEq('type', type)
  ),
  R.pluck('subtype'),
  R.uniq,
])(studentId)

export default async (type: string, instance) => R.ifElse(
  isAdmin(instance),
  fetchAdminDictionary,
  fetchStudentDictionary(instance.id)
)(type)
