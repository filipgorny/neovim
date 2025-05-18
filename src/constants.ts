import env from '../utils/env'

export const PASSWORD_MIN_LENGTH = 6
export const EXPRESS_PAYLOAD_LIMIT = '50mb'
export const MINUTES_TOKEN_IS_VALID = 180
export const POLLING_DELAY_IN_MINUTES = 10 // after each 10 minutes we check if we should send a notification. Must be a divisor of 60

export const PREVIEW_STUDENT_EMAIL = 'exam.preview@examkrackers.com'
export const DATE_FORMAT_YMD = 'YYYY-MM-DD'
export const DATETIME_DATABASE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS ZZ'
export const DATETIME_COURSE_FORMAT = 'MM/DD/YYYY HH:mm:ss ZZ'
export const DATETIME_JSON_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ'
export const DEFAULT_TIME_ZONE = 'America/New_York' // American Eastern Time
export const TIME_ZONE = env('APP_ENV') === 'production' ? DEFAULT_TIME_ZONE : 'Europe/Warsaw'

export const STUDY_TIME_DAY_PERIOD = 84 // 12 weeks

export const DATE_REGEXP_YMD = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/ // YYYY-MM-DD

export const CHAT_MODEL_VERSION = 'gpt-3.5-turbo'
export const CHAT_HISTORY_LIMIT = 20
