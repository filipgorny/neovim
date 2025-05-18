import { CourseBookChapterIds, deepSubtractSnapshotObjects, generateFlashcardArchiveSnaphsotObject } from '../student-flashcard-archive-service'

const courseBookChapterIdsArray: CourseBookChapterIds[] = [
  {
    course_id: 'course_1',
    book_id: 'book_1_1',
    chapter_id: 'chapter_1_1_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_2',
    chapter_id: 'chapter_1_2_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_1',
    chapter_id: 'chapter_1_1_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_3',
    chapter_id: 'chapter_1_3_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_2',
    chapter_id: 'chapter_1_2_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_3',
    chapter_id: 'chapter_1_3_2',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_2',
    chapter_id: 'chapter_1_2_2',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_2',
    chapter_id: 'chapter_1_2_4',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_4',
    chapter_id: 'chapter_1_4_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_4',
    chapter_id: 'chapter_1_4_2',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_3',
    chapter_id: 'chapter_1_3_2',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_2',
    chapter_id: 'chapter_1_2_3',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_2',
    chapter_id: 'chapter_1_2_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_3',
    chapter_id: 'chapter_1_3_3',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_5',
    chapter_id: 'chapter_1_5_2',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_5',
    chapter_id: 'chapter_1_5_2',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_3',
    chapter_id: 'chapter_1_3_5',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_4',
    chapter_id: 'chapter_1_4_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_2',
    chapter_id: 'chapter_1_2_2',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_4',
    chapter_id: 'chapter_1_4_2',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_5',
    chapter_id: 'chapter_1_5_4',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_6',
    chapter_id: 'chapter_1_6_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_1',
    chapter_id: 'chapter_1_1_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_6_1',
    chapter_id: 'chapter_1',
  },
  {
    course_id: 'course_1',
    book_id: 'book_1_5',
    chapter_id: 'chapter_1_5_1',
  },
]

const courseSnapshotResult = {
  id: 'course_1',
  amount: 25,
  books: [
    {
      id: 'book_1_1',
      amount: 3,
      chapters: [
        {
          id: 'chapter_1_1_1',
          amount: 3,
        },
      ],
    },
    {
      id: 'book_1_2',
      amount: 7,
      chapters: [
        {
          id: 'chapter_1_2_1',
          amount: 3,
        },
        {
          id: 'chapter_1_2_2',
          amount: 2,
        },
        {
          id: 'chapter_1_2_4',
          amount: 1,
        },
        {
          id: 'chapter_1_2_3',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_3',
      amount: 5,
      chapters: [
        {
          id: 'chapter_1_3_1',
          amount: 1,
        },
        {
          id: 'chapter_1_3_2',
          amount: 2,
        },
        {
          id: 'chapter_1_3_3',
          amount: 1,
        },
        {
          id: 'chapter_1_3_5',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_4',
      amount: 4,
      chapters: [
        {
          id: 'chapter_1_4_1',
          amount: 2,
        },
        {
          id: 'chapter_1_4_2',
          amount: 2,
        },
      ],
    },
    {
      id: 'book_1_5',
      amount: 4,
      chapters: [
        {
          id: 'chapter_1_5_2',
          amount: 2,
        },
        {
          id: 'chapter_1_5_4',
          amount: 1,
        },
        {
          id: 'chapter_1_5_1',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_6',
      amount: 1,
      chapters: [
        {
          id: 'chapter_1_6_1',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_6_1',
      amount: 1,
      chapters: [
        {
          id: 'chapter_1',
          amount: 1,
        },
      ],
    },
  ],
}

const courseArchiveSnapshotResult = {
  id: 'course_1',
  amount: 15,
  books: [
    {
      id: 'book_1_1',
      amount: 1,
      chapters: [
        {
          id: 'chapter_1_1_1',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_2',
      amount: 4,
      chapters: [
        {
          id: 'chapter_1_2_1',
          amount: 3,
        },
        {
          id: 'chapter_1_2_4',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_3',
      amount: 4,
      chapters: [
        {
          id: 'chapter_1_3_2',
          amount: 2,
        },
        {
          id: 'chapter_1_3_3',
          amount: 1,
        },
        {
          id: 'chapter_1_3_5',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_4',
      amount: 2,
      chapters: [
        {
          id: 'chapter_1_4_1',
          amount: 2,
        },
      ],
    },
    {
      id: 'book_1_5',
      amount: 3,
      chapters: [
        {
          id: 'chapter_1_5_2',
          amount: 1,
        },
        {
          id: 'chapter_1_5_4',
          amount: 1,
        },
        {
          id: 'chapter_1_5_1',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_6_1',
      amount: 1,
      chapters: [
        {
          id: 'chapter_1',
          amount: 1,
        },
      ],
    },
  ],
}

const snapshotSubtractionResult = {
  id: 'course_1',
  amount: 10,
  books: [
    {
      id: 'book_1_1',
      amount: 2,
      chapters: [
        {
          id: 'chapter_1_1_1',
          amount: 2,
        },
      ],
    },
    {
      id: 'book_1_2',
      amount: 3,
      chapters: [
        {
          id: 'chapter_1_2_1',
          amount: 0,
        },
        {
          id: 'chapter_1_2_2',
          amount: 2,
        },
        {
          id: 'chapter_1_2_4',
          amount: 0,
        },
        {
          id: 'chapter_1_2_3',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_3',
      amount: 1,
      chapters: [
        {
          id: 'chapter_1_3_1',
          amount: 1,
        },
        {
          id: 'chapter_1_3_2',
          amount: 0,
        },
        {
          id: 'chapter_1_3_3',
          amount: 0,
        },
        {
          id: 'chapter_1_3_5',
          amount: 0,
        },
      ],
    },
    {
      id: 'book_1_4',
      amount: 2,
      chapters: [
        {
          id: 'chapter_1_4_1',
          amount: 0,
        },
        {
          id: 'chapter_1_4_2',
          amount: 2,
        },
      ],
    },
    {
      id: 'book_1_5',
      amount: 1,
      chapters: [
        {
          id: 'chapter_1_5_2',
          amount: 1,
        },
        {
          id: 'chapter_1_5_4',
          amount: 0,
        },
        {
          id: 'chapter_1_5_1',
          amount: 0,
        },
      ],
    },
    {
      id: 'book_1_6',
      amount: 1,
      chapters: [
        {
          id: 'chapter_1_6_1',
          amount: 1,
        },
      ],
    },
    {
      id: 'book_1_6_1',
      amount: 0,
      chapters: [
        {
          id: 'chapter_1',
          amount: 0,
        },
      ],
    },
  ],
}

describe('student-flashcard-archive', () => {
  it('generate flashcard archive snapshot', async () => {
    const courseSnapshot = await generateFlashcardArchiveSnaphsotObject('course1')(courseBookChapterIdsArray)

    expect(courseSnapshot).toEqual(courseSnapshotResult)
  })

  it('deep subtraction of flashcard snapshots', async () => {
    const subtractionResult = deepSubtractSnapshotObjects(courseSnapshotResult, courseArchiveSnapshotResult)

    expect(subtractionResult).toEqual(snapshotSubtractionResult)
  })
})
