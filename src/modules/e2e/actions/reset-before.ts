import env from '../../../../utils/env'
import BeforeActions from './before'

export default async (actionName: string, payload: any) => {
  if (!['test', 'development'].includes(env('APP_ENV'))) {
    console.error('E2E reset-before action is available only in test environment')

    return true
  }

  const action = BeforeActions[actionName]

  if (!action) {
    return true
  }

  const result = await action(payload)

  return { resetActionBefore: actionName, payload, result }
}
