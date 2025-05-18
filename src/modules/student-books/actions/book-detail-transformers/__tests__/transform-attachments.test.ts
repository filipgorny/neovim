import { transformAttachments } from '../transform-attachments'

jest.mock('../../../../../../utils/env')

describe('transform-attachments', () => {
  it('transforms text attachments', () => {
    const input = {
      attachments: [
        {
          id: 42,
          delta_object: '{"foo": "bar"}',
          raw: 'small_image.png',
          type: 'main_text',
        },
      ],
    }
    const expected = { attachments: [{ delta_object: { foo: 'bar' }, id: 42, raw: 'small_image.png', type: 'main_text' }] }

    const result = transformAttachments(input)

    expect(result).toEqual(expected)
  })

  it('transforms file attachments', () => {
    const input = {
      attachments: [
        {
          id: 42,
          delta_object: '{"foo": "bar"}',
          raw: 'small_image.png',
          type: 'file',
        },
      ],
    }
    const expected = { attachments: [{ delta_object: null, foo: 'bar', id: 42, raw: 'small_image.png', type: 'file', url: 'https://s3.amazonaws.com/' }] }

    const result = transformAttachments(input)

    expect(result).toEqual(expected)
  })

  it('does nothing if attachments not present', () => {
    const input = {
      foo: [
        {
          id: 42,
          delta_object: '{"foo": "bar"}',
          raw: 'small_image.png',
          type: 'file',
        },
      ],
    }
    const expected = { foo: [{ delta_object: '{"foo": "bar"}', id: 42, raw: 'small_image.png', type: 'file' }] }

    const result = transformAttachments(input)

    expect(result).toEqual(expected)
  })
})
