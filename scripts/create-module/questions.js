module.exports = [
  {
    type: 'text',
    name: 'moduleName',
    message: 'Module name, plural (e.g. orders)',
  },
  {
    type: 'multiselect',
    name: 'createAlso',
    message: 'What to create as well?',
    choices: [
      { title: 'Migration', value: 'migration', selected: true },
      { title: 'Model', value: 'model', selected: true },
      { title: 'Repository (requires Model)', value: 'repository', selected: true },
      { title: 'CRUD (requires Repository)', value: 'crud', selected: true },
    ],
    max: 3,
    hint: '- Space to select. Return to submit',
  },
  {
    type: 'confirm',
    name: 'proceed',
    message: 'All done. Create module?',
    initial: true,
  },
]
