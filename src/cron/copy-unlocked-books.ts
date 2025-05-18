import { copyUnlockedBooks } from '../../services/books/copy-book/copy-unlocked-books'
import { init } from '../../services/cron/init'

const cronTime = '20 0 * * 6'
init(__filename, cronTime, copyUnlockedBooks)
