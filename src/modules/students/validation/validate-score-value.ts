import * as R from 'ramda'
import { badScoreValueException, throwException } from '../../../../utils/error/error-factory'

const throwBadScoreValueException = (method: 'low' | 'high', scoreDef: { min: number, max: number }): never => (throwException(badScoreValueException(method, scoreDef)))

const compareProp = (func: (v: unknown) => boolean, prop, value) => (
  R.pipe(
    R.prop(prop),
    // @ts-ignore
    func(value)
  )
)

export const validateScoreValue = (value: number) => (scoreDef: { min: number, max: number }) => R.pipe(
  // @ts-ignore
  R.when(
    // @ts-ignore
    compareProp(R.lt, 'min', value),
    (def: { min: number, max: number }) => throwBadScoreValueException('low', def)
  ),
  R.when(
    // @ts-ignore
    compareProp(R.gt, 'max', value),
    (def: { min: number, max: number }) => throwBadScoreValueException('high', def)
  )
  // @ts-ignore
)(scoreDef)
