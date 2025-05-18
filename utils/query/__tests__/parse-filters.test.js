const parseFilters = require('../parse-filters')

const allowedFilters = [
  'p.created_at',
  'retail_price',
  'producers.id',
  '__to_be_ordered',
  'snoozed_until',
]

describe('parse-filters', () => {
  it('parsuje przekazany obiekt z filtrami', () => {
    const filters = {
      retail_price: '>300',
      'p.created_at': '2016-12-02',
      'producers.id': ['123', '456'],
    }

    const expected = [
      {
        modifier: null,
        name: 'p.created_at',
        type: 'default',
        value: '2016-12-02',
      },
      {
        modifier: '>',
        name: 'retail_price',
        type: 'comparison',
        value: '300',
      },
      {
        modifier: null,
        name: 'producers.id',
        type: 'whereIn',
        value: [
          '123',
          '456',
        ],
      },
    ]

    const result = parseFilters(allowedFilters)(filters)

    expect(result).toEqual(expected)
  })

  it('pomija nieobsługiwane filtry', () => {
    const filters = {
      retail_price: '<300',
      foo: 'bar',
    }

    const expected = [
      {
        modifier: '<',
        name: 'retail_price',
        type: 'comparison',
        value: '300',
      },
    ]

    const result = parseFilters(allowedFilters)(filters)

    expect(result).toEqual(expected)
  })

  it('obsługuje filtr typu "range"', () => {
    const filters = {
      retail_price: '|300,500',
    }

    const expected = [
      {
        modifier: '|',
        name: 'retail_price',
        type: 'range',
        value: [300, 500],
      },
    ]

    const result = parseFilters(allowedFilters)(filters)

    expect(result).toEqual(expected)
  })

  it('obsługuje filtr specjalny (custom), który aplikuje bardziej złożoną logikę', () => {
    const filters = {
      __to_be_ordered: 'true',
    }

    const expected = [
      {
        modifier: null,
        name: '__to_be_ordered',
        type: '__to_be_ordered',
        value: true,
      },
    ]

    const result = parseFilters(allowedFilters)(filters)

    expect(result).toEqual(expected)
  })

  it('obsługuje filtr typu "isNull"', () => {
    const filters = {
      snoozed_until: 'isNull',
    }

    const expected = [
      {
        modifier: null,
        name: 'snoozed_until',
        type: 'isNull',
        value: 'isNull',
      },
    ]

    const result = parseFilters(allowedFilters)(filters)

    expect(result).toEqual(expected)
  })

  it('obsługuje filtr typu "isNotNull"', () => {
    const filters = {
      snoozed_until: 'isNotNull',
    }

    const expected = [
      {
        modifier: null,
        name: 'snoozed_until',
        type: 'isNotNull',
        value: 'isNotNull',
      },
    ]

    const result = parseFilters(allowedFilters)(filters)

    expect(result).toEqual(expected)
  })

  it('obsługuje filtr typu "orWhere"', () => {
    const filters = {
      snoozed_until: '?42',
    }

    const expected = [
      {
        modifier: '?',
        name: 'snoozed_until',
        type: 'orWhere',
        value: '42',
      },
    ]

    const result = parseFilters(allowedFilters)(filters)

    expect(result).toEqual(expected)
  })
})
