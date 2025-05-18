module.exports = [
  {
    type: 'text',
    name: 'moduleName',
    message: "Existing module's name (e.g. orders)",
  },
  {
    type: 'multiselect',
    name: 'actions',
    message: 'What actions should be created?',
    choices: [
      { title: 'C - Create', value: 'create', selected: true },
      { title: 'R - Read', value: 'read', selected: true },
      { title: 'U - Update', value: 'update', selected: true },
      { title: 'D - Delete', value: 'delete', selected: true },
    ],
    hint: '- Space to select. Return to submit',
  },
  {
    type: 'confirm',
    name: 'proceed',
    message: 'All done. Proceed?',
    initial: true,
  },
]
