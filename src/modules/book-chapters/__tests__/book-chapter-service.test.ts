import {
  createChapter,
  updateChapter,
  updateChapterOrder,
  deleteChapter,
  deletePart,
  fixSubchapterOrdering,
  cretateBookSubhaptersFromOriginalSubchapters
} from '../book-chapter-service'
import { create, update, findOneOrFail, remove, fixChapterOrderAfterDeleting, fixChapterOrderAfterAdding } from '../book-chapter-repository'
import { createSubchapter, deleteSubchapter, updateSubchapter } from '../../book-subchapters/book-subchapter-service'
import { detachByBookChapterId } from '../../chapter-admins/chapter-admins-service'
import { cretateBookContentsFromOriginalContents } from '../../book-contents/book-content-service'
import { fixPartsAfterDeleting } from '../../book-subchapters/book-subchapter-repository'

jest.mock('../book-chapter-repository', () => ({
  __esModule: true,
  create: jest.fn(),
  update: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  findOneOrFail: jest.fn(),
  remove: jest.fn((id, title) => ({ id })),
  fixChapterOrderAfterDeleting: jest.fn(),
  fixChapterOrderAfterAdding: jest.fn(),
}))

jest.mock('../../book-subchapters/book-subchapter-service')
jest.mock('../../chapter-admins/chapter-admins-service')
jest.mock('../../book-contents/book-content-service')
jest.mock('../../book-subchapters/book-subchapter-repository')

describe('book chapter service tests', () => {
  const id = '777'
  const chapter = {
    id,
    title: 'title',
    book_id: '777',
    order: 3,
    subchapters: [
      { id: 'subchapter777', part: 1, order: 1 },
      { id: 'subchapter333', part: 1, order: 2 },
      { id: 'subchapter111', part: 2, order: 1 },
    ],
  }

  afterEach(() => {
    (update as jest.Mock).mockReset();
    (findOneOrFail as jest.Mock).mockReset();
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    (findOneOrFail as jest.Mock).mockImplementation(() => Promise.resolve(chapter));
    (deleteSubchapter as jest.Mock).mockReset();
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    (updateSubchapter as jest.Mock).mockImplementation((subchapter_id) => jest.fn().mockImplementation(({ order }) => Promise.resolve({ subchapter_id, order })))
  })

  it('should check if createChapter creates chapter properly', async () => {
    const title = 'title'
    const order = 3
    const book_id = '777'
    const reorderChaptersFrom = true
    await createChapter(title, order, book_id, reorderChaptersFrom)
    expect(fixChapterOrderAfterAdding).toHaveBeenCalledTimes(1)
    expect(fixChapterOrderAfterAdding).toHaveBeenCalledWith(book_id, reorderChaptersFrom)
    expect(create).toBeCalledTimes(1)
    expect((create as jest.Mock).mock.calls[0]).toEqual([{ title, order, book_id }])
  })

  it('should check if updateChapter updates chapter properly', async () => {
    const id = '777'
    const dto = { id }
    await updateChapter(id)(dto)
    expect(update).toHaveBeenCalled()
    expect((update as jest.Mock).mock.calls[0]).toEqual([id, dto])
  })

  it('should check if updateChapterOrder updates chapter order properly', async () => {
    const id = '777'
    const order = 3
    await updateChapterOrder(id, order)
    expect(update).toHaveBeenCalledTimes(1)
    expect((update as jest.Mock).mock.calls[0]).toEqual([id, { order }])
  })

  it.skip('should check if deleteChapter deletes chapter properly', async () => {
    const result = await deleteChapter(true)(id)
    expect((findOneOrFail as jest.Mock).mock.calls.length).toBe(1)
    expect(await (findOneOrFail as jest.Mock).mock.results[0].value).toEqual(chapter)
    expect((remove as jest.Mock).mock.calls.length).toBe(1)
    expect((remove as jest.Mock).mock.calls[0][0]).toBe(id)
    expect(await (remove as jest.Mock).mock.results[0].value).toEqual({ id })
    expect((fixChapterOrderAfterDeleting as jest.Mock).mock.calls[0]).toEqual(['777', 3])
    expect((detachByBookChapterId as jest.Mock).mock.calls[0][0]).toBe(id)
    expect((deleteSubchapter as jest.Mock).mock.calls).toEqual([['subchapter777'], ['subchapter333'], ['subchapter111']])
    expect(result).toEqual({ id })
  })

  it.skip('should check if deletePart deletes part properly', async () => {
    const part = '1'
    const result = await deletePart(id, part)
    expect((findOneOrFail as jest.Mock).mock.calls.length).toBe(1)
    expect(await (findOneOrFail as jest.Mock).mock.results[0].value).toEqual(chapter)
    expect((fixPartsAfterDeleting as jest.Mock).mock.calls.length).toBe(1)
    expect((fixPartsAfterDeleting as jest.Mock).mock.calls[0]).toEqual([id, 2])
    expect((deleteSubchapter as jest.Mock).mock.calls).toEqual([['subchapter777'], ['subchapter333']])
    expect(result).toEqual([undefined, undefined])
  })

  it('should check if fixSubchapterOrdering fixes subchapter ordering properly', async () => {
    await fixSubchapterOrdering(id)
    expect((findOneOrFail as jest.Mock).mock.calls.length).toBe(1)
    expect(((await (updateSubchapter as jest.Mock).mock.results[0].value) as jest.Mock).mock.calls.length).toBe(1)
    expect(await ((await (updateSubchapter as jest.Mock).mock.results[0].value) as jest.Mock).mock.results[0].value).toEqual({ subchapter_id: 'subchapter777', order: 1 })
    expect(await ((await (updateSubchapter as jest.Mock).mock.results[1].value) as jest.Mock).mock.results[0].value).toEqual({ subchapter_id: 'subchapter111', order: 2 })
    expect(await ((await (updateSubchapter as jest.Mock).mock.results[2].value) as jest.Mock).mock.results[0].value).toEqual({ subchapter_id: 'subchapter333', order: 3 })
  })
})
