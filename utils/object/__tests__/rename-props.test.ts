import renameProps from '../rename-props'

describe('rename-props', () => {
  it('renames selected props in object', () => {
    const input = {
      emailAddress: 'foo@bar.baz',
      firstName: 'John',
      someId: 123
    }
    const expected = {
      email: 'foo@bar.baz',
      firstName: 'John',
      id: 123
    }
    const result = renameProps({
      emailAddress: 'email',
      someId: 'id'
    })(input)

    expect(result).toEqual(expected)
  })

  it('ignores missing props', () => {
    const input = {
      emailAddress: 'foo@bar.baz',
      firstName: 'John',
      someId: 123
    }
    const expected = {
      email: 'foo@bar.baz',
      firstName: 'John',
      id: 123
    }
    const result = renameProps({
      emailAddress: 'email',
      someId: 'id',
      nonExistingProp: 'crazyPropName'
    })(input)

    expect(result).toEqual(expected)
  })
})
