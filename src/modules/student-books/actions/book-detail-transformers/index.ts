import { transformFlashcards as flashcards } from './transform-flashcards'
import { transformContentQuestions as questions } from './transform-content-questions'
import { transformResources as resources } from './transform-resources'
import { transformAttachments as attachments } from './transform-attachments'
import { transformChapterImages as chapterImages } from './transform-chapter-images'
import { transformContentImages as contentImages } from './transform-content-images'
import { transformBookContents as bookContents } from './transform-book-contents'

export default {
  flashcards,
  questions,
  resources,
  attachments,
  chapterImages,
  contentImages,
  bookContents,
}
