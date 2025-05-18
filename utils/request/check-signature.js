const crypto = require('crypto')
const env = require('../env')
const { wrap } = require('express-promise-wrap')
const { throwException, invalidSignatureException, missingFileException } = require('../error/error-factory')

const throwInvalidSignatureException = () => throwException(invalidSignatureException())
const throwMissingFileException = () => throwException(missingFileException())

const changeToBuffer = value => Buffer.from(value, 'utf8')

const validateSignature = async (req, res, next) => {
  const avapriceSignature = req.body.signature

  if (avapriceSignature) {
    const hmac = crypto.createHmac('sha256', env('APP_SECRET'))
    const signatureBase = req.files.purchasePrices

    if (!signatureBase) throwMissingFileException()

    const hash = hmac.update(signatureBase.data).digest('hex')

    try {
      const signaturesMatch = await crypto.timingSafeEqual(
        changeToBuffer(avapriceSignature),
        changeToBuffer(hash)
      )

      if (signaturesMatch) return next()
    } catch (e) {
      throwInvalidSignatureException()
    }
  }

  throwInvalidSignatureException()
}

module.exports = wrap(validateSignature)
