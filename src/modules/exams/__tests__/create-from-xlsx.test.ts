import fs from 'fs'
import { simulateSyncStudent } from '../../students/actions/helpers/simulate-sync-student'
import createFromXlsx from '../actions/create-from-xlsx'
import { findOneOrFail } from '../../students/student-repository'
import { cretateLayout } from '../../layouts/layout-service'
import { ScoreCalculationMethod } from '../score-calculation-methods'
import { createFullMcatExamType } from '../../exam-types/__tests__/create-full-mcat-exam-type.help'
import createAdmin from '../../admins/actions/create-admin'
import { createFullMcatExam } from './create-full-mcat-exam.help'

describe('testing create from xlsx', () => {
  it.skip('should create a new exam', async () => {
    const payload = {
      email: 'bogdan+create+exam+1@gmail.com',
      password: '123qwe!',
      name: 'Bogdan Szczerbak',
    }

    const result = await createAdmin(payload)
    const admin = result.toJSON()

    const exam = await createFullMcatExam(admin, 'CREATE EXAM 1 EXAM TYPE', 'CREATE EXAM 1 LAYOUT', 'CREATED EXAM 1', 'CREATE_EXAM_1')

    expect(exam).toHaveProperty('id')
  })
})
