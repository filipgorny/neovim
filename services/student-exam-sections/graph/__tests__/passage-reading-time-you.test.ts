import { buildPassageTimeGraphData } from '../passage-reading-time-you'

describe('passage-reading-time-you', () => {
  it('creates a dataset for plotting PRT', () => {
    const passages = {
      '593db3e6-a94c-4e18-9701-0cb8101ac262': {
        reading: 20,
        question_amount: 5,
      },
      'a188fdfc-3d82-41b3-911a-56bc96312e5b': {
        reading: 25,
        question_amount: 4,
      },
      '8a5c3dfe-a150-4deb-acf9-ac73a096680e': {
        reading: 22,
        question_amount: 5,
      },
      '33dc6093-7b93-4681-a426-67bf07080bab': {
        reading: 31,
        question_amount: 3,
      },
      '9a9524bf-dd6c-4e96-a02c-e1fa82fd2f6a': {
        reading: 27,
        question_amount: 4,
      },
    }

    const expected = [
      { x: 1, y: 20, isEmpty: false },
      { x: 2, y: 20, isEmpty: false },
      { x: 3, y: 20, isEmpty: false },
      { x: 4, y: 20, isEmpty: false },
      { x: 5, y: 20, isEmpty: false },
      { x: 6, y: 25, isEmpty: false },
      { x: 7, y: 25, isEmpty: false },
      { x: 8, y: 25, isEmpty: false },
      { x: 9, y: 25, isEmpty: false },
      { x: 10, y: 22, isEmpty: false },
      { x: 11, y: 22, isEmpty: false },
      { x: 12, y: 22, isEmpty: false },
      { x: 13, y: 22, isEmpty: false },
      { x: 14, y: 22, isEmpty: false },
      { x: 15, y: 31, isEmpty: false },
      { x: 16, y: 31, isEmpty: false },
      { x: 17, y: 31, isEmpty: false },
      { x: 18, y: 27, isEmpty: false },
      { x: 19, y: 27, isEmpty: false },
      { x: 20, y: 27, isEmpty: false },
      { x: 21, y: 27, isEmpty: false },
    ]

    expect(buildPassageTimeGraphData('reading')(passages)).toEqual(expected)
  })
})
