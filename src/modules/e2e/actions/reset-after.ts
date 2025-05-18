import env from '../../../../utils/env'
import AfterActions from './after'

export default async (actionName: string, payload: any) => {
  if (!['test', 'development'].includes(env('APP_ENV'))) {
    console.error('E2E reset-after action is available only in test environment')

    return true
  }

  const action = AfterActions[actionName]

  if (!action) {
    return true
  }

  const result = await action(payload)

  return { resetActionAfter: actionName, payload, result }
}
