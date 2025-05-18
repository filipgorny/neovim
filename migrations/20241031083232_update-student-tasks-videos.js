exports.up = function (knex) {
  return knex("tasks")
    .where({ name: "Take your half-length MCAT" })
    .update({
      content: knex.raw("jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)", [
        JSON.stringify(
          "https://player.vimeo.com/video/1024715755?h=e0602ad410"
        ),
      ]),
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Set up your calendar" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/1024715725?h=d458d341fa"
              ),
            ]
          ),
        });
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Take a chapter exam" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/1024715592?h=74f4113acc"
              ),
            ]
          ),
        });
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Read your first chapter" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/1024715770?h=2d87db6378"
              ),
            ]
          ),
        });
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Watch a chapter video" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/1024715804?h=9f0c3d7450"
              ),
            ]
          ),
        });
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Review a chapter exam" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/1024715677?h=4f6ab6e5f5"
              ),
            ]
          ),
        });
    });
};

exports.down = function (knex) {
  return knex("tasks")
    .where({ name: "Take your half-length MCAT" })
    .update({
      content: knex.raw("jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)", [
        JSON.stringify("https://player.vimeo.com/video/998200450?h=b0fc2d3713"),
      ]),
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Set up your calendar" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/1002756796?h=ac48a269a2"
              ),
            ]
          ),
        });
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Take a chapter exam" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/998200981?h=b9313b0a43"
              ),
            ]
          ),
        });
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Read your first chapter" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/998200903?h=fb17aac639"
              ),
            ]
          ),
        });
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Watch a chapter video" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/998200542?h=f13dd83152"
              ),
            ]
          ),
        });
    })
    .then(() => {
      return knex("tasks")
        .where({ name: "Review a chapter exam" })
        .update({
          content: knex.raw(
            "jsonb_set(content::jsonb, '{videoUrl}', ?::jsonb)",
            [
              JSON.stringify(
                "https://player.vimeo.com/video/998200795?h=7fedf1de8a"
              ),
            ]
          ),
        });
    });
};
