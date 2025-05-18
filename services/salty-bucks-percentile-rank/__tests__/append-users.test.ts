import { appendUsers } from '../append-users'

describe('append-users.ts', () => {
  it('appends fake users if the list is not long enough (less than 4 items after the student)', () => {
    const student = { id: '83fdee0e-c865-4c60-9424-fb538e656ef2', name: 'Foo', salty_bucks_balance: 500, percentile_rank: 90, percentile_position: 2 }
    const list = [
      { id: '83fdee0e-c865-4c60-9424-fb538e656ef1', name: 'John', salty_bucks_balance: 1000, percentile_rank: 100, percentile_position: 1 },
      student,
      { id: '83fdee0e-c865-4c60-9424-fb538e656ef3', name: 'tom', salty_bucks_balance: 400, percentile_rank: 60, percentile_position: 3 },
      { id: '83fdee0e-c865-4c60-9424-fb538e656ef4', name: 'rick', salty_bucks_balance: 300, percentile_rank: 50, percentile_position: 4 },
    ]

    const result = appendUsers(student, list)

    // There are always ten elements appended, regardless of the list length
    expect(result.length).toEqual(14)

    // The percentile rank of the appended elements should gradually decline or stay at the same level
    expect(result[4].percentile_rank).toBeLessThanOrEqual(50)
    expect(result[5].percentile_rank).toBeLessThanOrEqual(result[4].percentile_rank)
    expect(result[6].percentile_rank).toBeLessThanOrEqual(result[5].percentile_rank)
    expect(result[7].percentile_rank).toBeLessThanOrEqual(result[6].percentile_rank)

    // The percentile position of the appended elements should gradually increase by one
    expect(result[4].percentile_position).toEqual(5)
    expect(result[5].percentile_position).toEqual(6)
    expect(result[6].percentile_position).toEqual(7)
    expect(result[7].percentile_position).toEqual(8)
  })
})
