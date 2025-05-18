const Glossary = bookshelf => bookshelf.model('Glossary', {
  tableName: 'glossary',
  uuid: true,
})

export default Glossary
