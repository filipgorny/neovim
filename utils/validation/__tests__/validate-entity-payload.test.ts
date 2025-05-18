import Joi from 'joi'
import validateEntityPayload from '../validate-entity-payload'

const schema = Joi.object({
  title: Joi.string().required(),
})

describe('validate-entity-payload', () => {
  it('returns payload when it fits validation schema', () => {
    const payload = {
      title: 'Foo bar',
    }

    const expected = {
      title: 'Foo bar',
    }

    const result = validateEntityPayload(schema)(payload)

    expect(result).toEqual(expected)
  })

  it('throws exception when payload fails validation', () => {
    const payload = {
      category: 42,
    }

    expect(
      () => validateEntityPayload(schema)(payload)
    ).toThrow()
  })
})
