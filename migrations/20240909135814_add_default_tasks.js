const { v4: uuidv4 } = require('uuid');

exports.up = async function(knex) {
  const defaultTasks = [
    {
      id: uuidv4(),
      name: 'Learn how to study',
      content: JSON.stringify({
        description: 'Learn how to be successful at MCAT prep using the Read, Lecture, Test, Review cycle, based on founder Jon Orsay’s 25+ years helping students.',
        videoUrl: 'https://player.vimeo.com/video/1002756796?h=ac48a269a2'
      }),
      is_active: true,
      order: 1,
      type: 'getting-started',
      created_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'Set up your calendar',
      content: JSON.stringify({
        description: 'Get set up for success by creating a custom study calendar. Use the calendar widget on your dashboard, or find your calendar through the Menu.',
        videoUrl: 'https://player.vimeo.com/video/1002758143?h=283afd5fb6'
      }),
      is_active: true,
      order: 2,
      type: 'getting-started',
      created_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'Take your half-length MCAT',
      content: JSON.stringify({
        description: 'While you may not feel ready, now is actually the perfect time to take your first exam. The result of your first exam will provide data on where to best focus your study efforts.',
        videoUrl: 'https://player.vimeo.com/video/998200450?h=b0fc2d3713'
      }),
      is_active: true,
      order: 3,
      type: 'getting-started',
      created_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'Read your first chapter',
      content: JSON.stringify({
        description: 'Start the Read, Lecture, Test, Review cycle by reading your first chapter. We recommend starting with LAB 1. Don’t forget to highlight, take notes, and answer questions as you discover our interactive hyperbooks.',
        videoUrl: 'https://player.vimeo.com/video/998200903?h=fb17aac639'
      }),
      is_active: true,
      order: 4,
      type: 'getting-started',
      created_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'Watch a chapter video',
      content: JSON.stringify({
        description: 'Continue through the Read, Lecture, Test, Review cycle and watch a video (lecture) from your current chapter. You can also find more videos by navigating to Menu > Videos.',
        videoUrl: 'https://player.vimeo.com/video/998200542?h=f13dd83152'
      }),
      is_active: true,
      order: 5,
      type: 'getting-started',
      created_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'Take a chapter exam',
      content: JSON.stringify({
        description: 'Continue through the Read, Lecture, Test, Review cycle and take a chapter exam to test your knowledge.',
        videoUrl: 'https://player.vimeo.com/video/998200981?h=b9313b0a43'
      }),
      is_active: true,
      order: 6,
      type: 'getting-started',
      created_at: new Date()
    },
    {
      id: uuidv4(),
      name: 'Review a chapter exam',
      content: JSON.stringify({
        description: 'Review your exam performance to gain insights moving forward. Use this same Read, Lecture, Test, Review cycle as you continue through your MCAT prep, along with other tools like flashcards and content questions.',
        videoUrl: 'https://player.vimeo.com/video/998200795?h=7fedf1de8a'
      }),
      is_active: true,
      order: 7,
      type: 'getting-started',
      created_at: new Date()
    }
  ];

  await knex('tasks').insert(defaultTasks);
};

exports.down = async function(knex) {
  // Remove the default tasks
  await knex('tasks').whereIn('name', ['Learn how to study', 'Set up your calendar', 'Take your half-length MCAT', 'Read your first chapter', 'Watch a chapter video', 'Take a chapter exam', 'Review a chapter exam']).del();
};
