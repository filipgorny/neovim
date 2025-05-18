import mapp from '../mapp'

describe('mapp', () => {
  it('applies each item of an array to an async function and waits for results', async () => {
    const input = [42, 12]
    const fn = async x => x * 2

    const expected = [84, 24]

    const result = await mapp(fn)(input)

    expect(result).toEqual(expected)
  })
})
