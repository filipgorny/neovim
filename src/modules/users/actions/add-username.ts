import * as R from 'ramda'
import { findOne } from '../users-repository'
import addUsername from '../../students/actions/add-username'

export default async (user: any, payload: any) => R.pipeWith(R.andThen)([
  async () => findOne({ id: user.id }, ['student']),
  R.prop('student'),
  async student => addUsername(student, payload),
  async () => findOne({ id: user.id }, ['student']),
])(true)
