#!/bin/sh
cd /usr/src/app/ || exit 1
npx knex migrate:latest | tee -a /usr/src/app/knex-migrate.log