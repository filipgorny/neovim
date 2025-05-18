exports.up = function (knex) {
  return knex("tasks")
    .where({ name: "Set up your calendar" })
    .update({
      content: knex.raw("jsonb_set(content::jsonb, '{description}', ?::jsonb)", [
        JSON.stringify(
          "Get set up for success by creating a custom study calendar. Find your calendar through the Menu."
        ),
      ]),
    })
};

exports.down = function (knex) {
  return knex("tasks")
    .where({ name: "Set up your calendar" })
    .update({
      content: knex.raw("jsonb_set(content::jsonb, '{description}', ?::jsonb)", [
        JSON.stringify("Get set up for success by creating a custom study calendar. Use the calendar widget on your dashboard, or find your calendar through the Menu."),
      ]),
    })
};
