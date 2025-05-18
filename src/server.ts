import '../services/dotenv/dotenv'
import '../services/logger/console-override'
import path from 'path'
import express, { Request, Response, NextFunction } from 'express'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import { EXPRESS_PAYLOAD_LIMIT } from './constants'
import methodOverride from 'method-override'
import fileUpload from 'express-fileupload'
import cors from 'cors'
import { registerEventHandlers } from '../services/events/events-service'
import { registerSocketClient } from './sockets/socket-client'
import { attachRoutes } from './server-routes'
import Counter from '../services/counter/counter'
import { v4 as uuid } from 'uuid'
import logger from '../services/logger/logger'
import env from '../utils/env'

export const __basedir = path.resolve('__dirname/..')
export const requestCounter = new Counter()

const app = express()
const router = express.Router()

if (process.env.CI_ENV && process.env.SENTRY_DSN) {
  Sentry.init({
    environment: process.env.CI_ENV,
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  })

  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
}

// app.use((req: Request, res: Response, next: NextFunction) => {
//   const start = Date.now()
//   requestCounter.increment()
//   const requestId = uuid()

//   logger.info(`New req: ${req.method} ${req.originalUrl} requestId=${requestId}`)
//   logger.info(`++Current request counter: ${requestCounter.getCount()}`)

//   res.on('finish', () => {
//     const duration = Date.now() - start
//     requestCounter.decrement()

//     logger.info(`Finish req: ${req.method} ${req.originalUrl} status=${res.statusCode} duration=${duration}ms requestId=${requestId}`)
//     logger.info(`--Current request counter: ${requestCounter.getCount()}`)
//   })

//   next()
// })

// Attach middleware
app.use((req: Request, res: Response, next: NextFunction) => { next() }, cors({ maxAge: 84600 }))
app.use(express.urlencoded({ extended: false, limit: EXPRESS_PAYLOAD_LIMIT, parameterLimit: 50000 }))
app.use(express.json({ limit: EXPRESS_PAYLOAD_LIMIT }))
app.use(fileUpload({
  abortOnLimit: true,
  limits: { fileSize: 3 * 1024 * 1024 },
}))

const defaultResponseType = 'application/json'

const errorHandler = (err: any, req: any, res: any, next: any) => {
  if (res.headersSent) {
    return next(err)
  }

  console.log(err)

  res.type(defaultResponseType)

  if (err.isSpecialError) {
    res.status(err.error.statusCode || 400)
    res.json(err)
  } else {
    res.status(err.statusCode || 500)
    res.json({
      error: {
        errorCode: err.errorCode || 'default-error',
        message: err.message,
        statusCode: err.statusCode || 500,
      },
    })
  }
}

// Health-check route
app.get('/', (req: Request, res: Response) => res.type(defaultResponseType).send({ data: 'OK' }))

// Set base url
app.use('/', router)

// Bind routes
attachRoutes(router)

app.use(Sentry.Handlers.errorHandler())

// Attach default error handler
app.use(methodOverride())
app.use(errorHandler)

registerSocketClient()

// Start the API
if (env('NODE_ENV') !== 'unit_test_env') {
  app.listen(env('PORT'), () => logger.info(`API @ port ${env('PORT')}!`))
}

registerEventHandlers()
