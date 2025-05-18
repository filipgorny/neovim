import R from 'ramda'
import { wrap } from 'express-promise-wrap'
import validateEntityPayload from '../validation/validate-entity-payload'
import { ErrorRequestHandler, type Request, RequestHandler, type Response } from 'express'
import { Student } from '../../src/types/student'
import { Admin } from '../../src/types/admin'
import { FetchQueryParam } from '../../src/types/fetch-query'
import { ImpersonateData } from '../../src/types/impersonate'
import { PreviewData } from '../../src/types/preview'
import { BookshelfEntity } from '../../src/types/bookshelf-entity'
import { StudentCourse } from '../../src/types/student-course'
import { Files } from '../../src/types/files'

/**
 * Transforms the request according to the given rules
 */
const morph = (blueprint: object) => R.pipe(
  R.applySpec(blueprint),
  R.values
)

type User = BookshelfEntity<Student | Admin>

/**
 * Request transformation helpers
 */
export const userId: (req: Request) => string = R.path(['user', 'id'])
export const user: <User = any>(req: Request) => User = R.prop('user')
export const student = user<BookshelfEntity<Student>>
export const admin = user<BookshelfEntity<Admin>>
export const impersonate: (req: Request) => ImpersonateData = R.prop('impersonate_data')
export const preview: (req: Request) => PreviewData = R.prop('preview_data')
export const payload: <Payload = any>(req: Request) => Payload = R.prop('body')
export const urlParams: (req: Request) => any = R.prop('params')
export const id: (req: Request) => string = R.path(['params', 'id'])
export const files: <Names extends string[]>(req: Request) => Files<Names> = R.prop('files')
export const customParam = (param: string): (req: Request) => string => R.path(['params', param])
export const query: <Query = any>(req: Request) => Query = R.prop('query')
export const fetchQuery = query<FetchQueryParam>
export const request: (req: Request) => Request = R.identity

/**
 * Extract payload and validate it using given schema
 */
export const payloadValidate = <Payload = any>(schema: any): (req: Request) => Payload => R.pipe(
  R.prop('body'),
  validateEntityPayload(schema)
)

export const queryValidate = <Query = any>(schema: any): (req: Request) => Query => R.pipe(
  R.prop('query'),
  validateEntityPayload(schema)
)

/**
 * Domain specific
 */
const getStudentId = (user: User): string => user.get('id') // fixme redundant, see userId

export const studentId: (req: Request) => string = R.pipe(user, getStudentId) // fixme redundant, see userId
export const studentCourse: (req: Request) => StudentCourse = R.prop('studentCourse')

/**
 * Applies transformers to the response, in the given order
 *
 * @param transformers
 */
const applyTransformers = (transformers: Function[]) => (response: any) => (
  R.ifElse(
    R.anyPass([
      R.isEmpty,
      R.isNil,
    ]),
    R.always(response),
    R.reduce(
      (result, transform) => transform(result),
      response
    )
  )(transformers)
)

type Handler = (...args: any[]) => any | Promise<any>
type Param<T> = (req?: Request) => T
type Params<T extends any[]> = { [K in keyof T]: Param<T[K]> }
type Transformer = (response: any) => any

/**
 * Attaches the handler to a specific route
 */
export const route = <
  THandler extends Handler,
  TParameters extends any[] = Parameters<THandler>,
  TParams extends Params<TParameters> = Params<TParameters>
>(handler: THandler, params: TParams = [] as TParams, transformers: Transformer[] = []): RequestHandler | ErrorRequestHandler => (
    wrap(
      async (req: Request, res: Response) => {
        // eslint-disable-next-line no-debugger
        // debugger

        const result = await handler(
          ...morph(params)(req)
        )

        res.send(applyTransformers(transformers)(result))
      }
    )
  )

type OmitFirst<T extends any[]> = T extends [any, ...infer R] ? R : never
type RawParams<T extends any[]> = Params<OmitFirst<T>>

/**
 * Attaches the handler to a specific route but it has to handle the response
 */
export const routeRaw = <
  THandler extends Handler,
  TParameters extends any[] = Parameters<THandler>,
  TParams extends RawParams<TParameters> = RawParams<TParameters>
>(handler: THandler, params: TParams = ([] as any) as TParams): RequestHandler | ErrorRequestHandler => (
    wrap(
      async (req: Request, res: Response) => {
        // eslint-disable-next-line no-debugger
        // debugger

        return handler(
          res,
          ...morph(params)(req)
        )
      }
    )
  )

/**
 * Attaches the handler to a specific route and redirects as a result
 */
export const routeRedirect = <
  THandler extends Handler,
  TParameters extends any[] = Parameters<THandler>,
  TParams extends Params<TParameters> = Params<TParameters>
>(handler: THandler, params: TParams = [] as TParams): RequestHandler | ErrorRequestHandler => (
    wrap(
      async (req: Request, res: Response) => {
        // eslint-disable-next-line no-debugger
        // debugger

        return res.redirect(
          await handler(
            ...morph(params)(req)
          )
        )
      }
    )
  )
