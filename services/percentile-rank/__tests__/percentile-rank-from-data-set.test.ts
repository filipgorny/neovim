import { percentileRank } from '../percentile-rank-from-data-set'

/**
 * Calculates the percentile rank based on the data set.
 *
 * https://en.wikipedia.org/wiki/Percentile_rank
 */

describe('percentile-rank-from-data-set', () => {
  it('calculates PR as per example in the Wikipedia', async () => {
    const data = [
      [1, 1],
      [2, 1],
      [3, 3],
      [4, 2],
      [5, 2],
      [6, 0],
      [7, 1],
    ]

    const expected = [
      {
        cumulative_frequency: 1,
        frequency: 1,
        percentile_rank: 5,
        value: 1,
      },
      {
        cumulative_frequency: 2,
        frequency: 1,
        percentile_rank: 15,
        value: 2,
      },
      {
        cumulative_frequency: 5,
        frequency: 3,
        percentile_rank: 35,
        value: 3,
      },
      {
        cumulative_frequency: 7,
        frequency: 2,
        percentile_rank: 60,
        value: 4,
      },
      {
        cumulative_frequency: 9,
        frequency: 2,
        percentile_rank: 80,
        value: 5,
      },
      {
        cumulative_frequency: 9,
        frequency: 0,
        percentile_rank: 90,
        value: 6,
      },
      {
        cumulative_frequency: 10,
        frequency: 1,
        percentile_rank: 95,
        value: 7,
      },
    ]

    const result = await percentileRank(data, 10)

    expect(result).toEqual(expected)
  })

  it('calculates PR with unsorted data', async () => {
    const data = [
      [3, 3],
      [1, 1],
      [5, 2],
      [4, 2],
      [2, 1],
      [7, 1],
      [6, 0],
    ]

    const expected = [
      {
        cumulative_frequency: 1,
        frequency: 1,
        percentile_rank: 5,
        value: 1,
      },
      {
        cumulative_frequency: 2,
        frequency: 1,
        percentile_rank: 15,
        value: 2,
      },
      {
        cumulative_frequency: 5,
        frequency: 3,
        percentile_rank: 35,
        value: 3,
      },
      {
        cumulative_frequency: 7,
        frequency: 2,
        percentile_rank: 60,
        value: 4,
      },
      {
        cumulative_frequency: 9,
        frequency: 2,
        percentile_rank: 80,
        value: 5,
      },
      {
        cumulative_frequency: 9,
        frequency: 0,
        percentile_rank: 90,
        value: 6,
      },
      {
        cumulative_frequency: 10,
        frequency: 1,
        percentile_rank: 95,
        value: 7,
      },
    ]

    const result = await percentileRank(data, 10)

    expect(result).toEqual(expected)
  })
})
