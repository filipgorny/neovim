import * as R from 'ramda'
import concatPath from '../concatpath'

const book = {
  chapters: [{
    chapter: 1,
    subchapters: [{
      subchapter: 1,
      contents: [{
        content: 1,
        flashcards: [{
          flashcard: 1,
        },
        {
          flashcard: 2,
        },
        {
          flashcard: 3,
        }],
        questions: [{
          question: 1,
        },
        {
          question: 2,
        },
        {
          question: 3,
        }],
      },
      {
        content: 2,
        flashcards: [{
          flashcard: 10,
        },
        {
          flashcard: 20,
        },
        {
          flashcard: 30,
        }],
        questions: [{
          question: 10,
        },
        {
          question: 20,
        },
        {
          question: 30,
        }],
      }],
    },
    {
      subchapter: 2,
      contents: [{
        content: 3,
        flashcards: [{
          flashcard: 100,
        },
        {
          flashcard: 200,
        },
        {
          flashcard: 300,
        }],
        questions: [{
          question: 100,
        },
        {
          question: 200,
        },
        {
          question: 300,
        }],
      },
      {
        content: 4,
        flashcards: [{
          flashcard: 1000,
        },
        {
          flashcard: 2000,
        },
        {
          flashcard: 3000,
        }],
        questions: [{
          question: 1000,
        },
        {
          question: 2000,
        },
        {
          question: 3000,
        }],
      }],
    }],
  },
  {
    chapter: 2,
    subchapters: [{
      subchapter: 3,
      contents: [{
        content: 5,
        flashcards: [{
          flashcard: 10000,
        },
        {
          flashcard: 20000,
        },
        {
          flashcard: 30000,
        }],
        questions: [{
          question: 10000,
        },
        {
          question: 20000,
        },
        {
          question: 30000,
        }],
      },
      {
        content: 6,
        flashcards: [{
          flashcard: 100000,
        },
        {
          flashcard: 200000,
        },
        {
          flashcard: 300000,
        }],
        questions: [{
          question: 100000,
        },
        {
          question: 200000,
        },
        {
          question: 300000,
        }],
      }],
    },
    {
      subchapter: 4,
      contents: [{
        content: 7,
        flashcards: [{
          flashcard: 1000000,
        },
        {
          flashcard: 2000000,
        },
        {
          flashcard: 3000000,
        }],
        questions: [{
          question: 1000000,
        },
        {
          question: 2000000,
        },
        {
          question: 3000000,
        }],
      },
      {
        content: 8,
        flashcards: [{
          flashcard: 10000000,
        },
        {
          flashcard: 20000000,
        },
        {
          flashcard: 30000000,
        }],
        questions: [{
          question: 10000000,
        },
        {
          question: 20000000,
        },
        {
          question: 30000000,
        }],
      }],
    }],
  }],
}

const subchapters = [
  {
    subchapter: 1,
    contents: [{
      content: 1,
      flashcards: [{
        flashcard: 1,
      },
      {
        flashcard: 2,
      },
      {
        flashcard: 3,
      }],
      questions: [{
        question: 1,
      },
      {
        question: 2,
      },
      {
        question: 3,
      }],
    },
    {
      content: 2,
      flashcards: [{
        flashcard: 10,
      },
      {
        flashcard: 20,
      },
      {
        flashcard: 30,
      }],
      questions: [{
        question: 10,
      },
      {
        question: 20,
      },
      {
        question: 30,
      }],
    }],
  },
  {
    subchapter: 2,
    contents: [{
      content: 3,
      flashcards: [{
        flashcard: 100,
      },
      {
        flashcard: 200,
      },
      {
        flashcard: 300,
      }],
      questions: [{
        question: 100,
      },
      {
        question: 200,
      },
      {
        question: 300,
      }],
    },
    {
      content: 4,
      flashcards: [{
        flashcard: 1000,
      },
      {
        flashcard: 2000,
      },
      {
        flashcard: 3000,
      }],
      questions: [{
        question: 1000,
      },
      {
        question: 2000,
      },
      {
        question: 3000,
      }],
    }],
  },
  {
    subchapter: 3,
    contents: [{
      content: 5,
      flashcards: [{
        flashcard: 10000,
      },
      {
        flashcard: 20000,
      },
      {
        flashcard: 30000,
      }],
      questions: [{
        question: 10000,
      },
      {
        question: 20000,
      },
      {
        question: 30000,
      }],
    },
    {
      content: 6,
      flashcards: [{
        flashcard: 100000,
      },
      {
        flashcard: 200000,
      },
      {
        flashcard: 300000,
      }],
      questions: [{
        question: 100000,
      },
      {
        question: 200000,
      },
      {
        question: 300000,
      }],
    }],
  },
  {
    subchapter: 4,
    contents: [{
      content: 7,
      flashcards: [{
        flashcard: 1000000,
      },
      {
        flashcard: 2000000,
      },
      {
        flashcard: 3000000,
      }],
      questions: [{
        question: 1000000,
      },
      {
        question: 2000000,
      },
      {
        question: 3000000,
      }],
    },
    {
      content: 8,
      flashcards: [{
        flashcard: 10000000,
      },
      {
        flashcard: 20000000,
      },
      {
        flashcard: 30000000,
      }],
      questions: [{
        question: 10000000,
      },
      {
        question: 20000000,
      },
      {
        question: 30000000,
      }],
    }],
  },
]

const contents = [
  {
    content: 1,
    flashcards: [{
      flashcard: 1,
    },
    {
      flashcard: 2,
    },
    {
      flashcard: 3,
    }],
    questions: [{
      question: 1,
    },
    {
      question: 2,
    },
    {
      question: 3,
    }],
  },
  {
    content: 2,
    flashcards: [{
      flashcard: 10,
    },
    {
      flashcard: 20,
    },
    {
      flashcard: 30,
    }],
    questions: [{
      question: 10,
    },
    {
      question: 20,
    },
    {
      question: 30,
    }],
  },
  {
    content: 3,
    flashcards: [{
      flashcard: 100,
    },
    {
      flashcard: 200,
    },
    {
      flashcard: 300,
    }],
    questions: [{
      question: 100,
    },
    {
      question: 200,
    },
    {
      question: 300,
    }],
  },
  {
    content: 4,
    flashcards: [{
      flashcard: 1000,
    },
    {
      flashcard: 2000,
    },
    {
      flashcard: 3000,
    }],
    questions: [{
      question: 1000,
    },
    {
      question: 2000,
    },
    {
      question: 3000,
    }],
  },
  {
    content: 5,
    flashcards: [{
      flashcard: 10000,
    },
    {
      flashcard: 20000,
    },
    {
      flashcard: 30000,
    }],
    questions: [{
      question: 10000,
    },
    {
      question: 20000,
    },
    {
      question: 30000,
    }],
  },
  {
    content: 6,
    flashcards: [{
      flashcard: 100000,
    },
    {
      flashcard: 200000,
    },
    {
      flashcard: 300000,
    }],
    questions: [{
      question: 100000,
    },
    {
      question: 200000,
    },
    {
      question: 300000,
    }],
  },
  {
    content: 7,
    flashcards: [{
      flashcard: 1000000,
    },
    {
      flashcard: 2000000,
    },
    {
      flashcard: 3000000,
    }],
    questions: [{
      question: 1000000,
    },
    {
      question: 2000000,
    },
    {
      question: 3000000,
    }],
  },
  {
    content: 8,
    flashcards: [{
      flashcard: 10000000,
    },
    {
      flashcard: 20000000,
    },
    {
      flashcard: 30000000,
    }],
    questions: [{
      question: 10000000,
    },
    {
      question: 20000000,
    },
    {
      question: 30000000,
    }],
  },
]

const flashcards = [
  {
    flashcard: 1,
  },
  {
    flashcard: 2,
  },
  {
    flashcard: 3,
  },
  {
    flashcard: 10,
  },
  {
    flashcard: 20,
  },
  {
    flashcard: 30,
  },
  {
    flashcard: 100,
  },
  {
    flashcard: 200,
  },
  {
    flashcard: 300,
  },
  {
    flashcard: 1000,
  },
  {
    flashcard: 2000,
  },
  {
    flashcard: 3000,
  },
  {
    flashcard: 10000,
  },
  {
    flashcard: 20000,
  },
  {
    flashcard: 30000,
  },
  {
    flashcard: 100000,
  },
  {
    flashcard: 200000,
  },
  {
    flashcard: 300000,
  },
  {
    flashcard: 1000000,
  },
  {
    flashcard: 2000000,
  },
  {
    flashcard: 3000000,
  },
  {
    flashcard: 10000000,
  },
  {
    flashcard: 20000000,
  },
  {
    flashcard: 30000000,
  },
]

describe('concatPath', () => {
  it('subchapters', () => {
    const result = concatPath(['chapters', 'subchapters'])(book)

    expect(result).toEqual(subchapters)
  })

  it('subchapters with rest path', () => {
    const result = concatPath(['chapters', 'subchapters'], ['subchapter'])(book)

    expect(result).toEqual([1, 2, 3, 4])
  })

  it('contents', () => {
    const result = concatPath(['chapters', 'subchapters', 'contents'])(book)

    expect(result).toEqual(contents)
  })

  it('contents with rest path', () => {
    const result = concatPath(['chapters', 'subchapters', 'contents'], ['content'])(book)

    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('flahscards', () => {
    const result = concatPath(['chapters', 'subchapters', 'contents', 'flashcards'])(book)

    expect(result).toEqual(flashcards)
  })

  it('flahscards with rest path', () => {
    const result = concatPath(['chapters', 'subchapters', 'contents', 'flashcards'], ['flashcard'])(book)

    expect(result).toEqual([1, 2, 3, 10, 20, 30, 100, 200, 300, 1000, 2000, 3000, 10000, 20000, 30000, 100000, 200000, 300000, 1000000, 2000000, 3000000, 10000000, 20000000, 30000000])
  })

  it('questions', () => {
    const result = concatPath(['chapters', 'subchapters', 'contents', 'questions'])(book)

    expect(result).toEqual(R.map(f => ({ question: f.flashcard }))(flashcards))
  })

  it('questions with rest path', () => {
    const result = concatPath(['chapters', 'subchapters', 'contents', 'questions'], ['question'])(book)

    expect(result).toEqual([1, 2, 3, 10, 20, 30, 100, 200, 300, 1000, 2000, 3000, 10000, 20000, 30000, 100000, 200000, 300000, 1000000, 2000000, 3000000, 10000000, 20000000, 30000000])
  })

  it('mapping function', () => {
    const f = a => 2 * a
    const result = concatPath(['chapters', 'subchapters', 'contents', 'questions'], ['question'], f)(book)

    expect(result).toEqual(R.map(f)([1, 2, 3, 10, 20, 30, 100, 200, 300, 1000, 2000, 3000, 10000, 20000, 30000, 100000, 200000, 300000, 1000000, 2000000, 3000000, 10000000, 20000000, 30000000]))
  })
})
