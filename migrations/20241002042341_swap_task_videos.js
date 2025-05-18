exports.up = function(knex) {
  return knex('tasks')
    .where({ name: 'Learn how to study' })
    .update({
      content: knex.raw('jsonb_set(content::jsonb, \'{videoUrl}\', ?::jsonb)', [JSON.stringify('https://player.vimeo.com/video/1002758143?h=283afd5fb6')])
    })
    .then(() => {
      return knex('tasks')
        .where({ name: 'Set up your calendar' })
        .update({
          content: knex.raw('jsonb_set(content::jsonb, \'{videoUrl}\', ?::jsonb)', [JSON.stringify('https://player.vimeo.com/video/1002756796?h=ac48a269a2')])
        });
    });
};

exports.down = function(knex) {
  return knex('tasks')
    .where({ name: 'Learn how to study' })
    .update({
      content: knex.raw('jsonb_set(content::jsonb, \'{videoUrl}\', ?::jsonb)', [JSON.stringify('https://player.vimeo.com/video/1002756796?h=ac48a269a2')])
    })
    .then(() => {
      return knex('tasks')
        .where({ name: 'Set up your calendar' })
        .update({
          content: knex.raw('jsonb_set(content::jsonb, \'{videoUrl}\', ?::jsonb)', [JSON.stringify('https://player.vimeo.com/video/1002758143?h=283afd5fb6')])
        });
    });
};
