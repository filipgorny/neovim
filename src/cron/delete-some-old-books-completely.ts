import { deleteOldArchivedOrSoftDeletedUnlockedBooksCompletely } from '../modules/books/book-service'
import { init } from '../../services/cron/init'

/**
 * Removal of old books
 */
const cronTime = '0 1 * * 0'
init(__filename, cronTime, deleteOldArchivedOrSoftDeletedUnlockedBooksCompletely)
