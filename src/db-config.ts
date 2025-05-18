import configFile from '../knexfile'
import { knex } from 'knex'
import Bookshelf from 'bookshelf'
import bookshelfUuid from 'bookshelf-uuid'
import bookshelfEloquent from 'bookshelf-eloquent'

const knexInstance = knex(configFile[process.env.NODE_ENV])
// @ts-ignore
const bookshelf = Bookshelf(knexInstance)

bookshelf.plugin(bookshelfUuid)
bookshelf.plugin(bookshelfEloquent)

export default bookshelf
