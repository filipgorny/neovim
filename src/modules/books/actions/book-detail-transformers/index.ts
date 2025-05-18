import { transformBookContents } from './transform-book-contents'
import { transformFlashcards } from './transform-flashcards'
import { transformContentImages } from './transform-content-images'
import { transformChapterImages } from './transform-chapter-images'
import { transformAttachments } from './transform-attachments'
import { transformResources } from './transform-resources'
import { transformContentQuestions } from './transform-content-questions'

export default {
  bookContents: transformBookContents,
  flashcards: transformFlashcards,
  contentImages: transformContentImages,
  chapterImages: transformChapterImages,
  attachments: transformAttachments,
  resources: transformResources,
  contentQuestions: transformContentQuestions,
}
