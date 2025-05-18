# ExamKrackers API
Back-end service for ExamKrackers.

## Local development using DeKick
DeKick is a tool for provisioning and building local, test, beta and production environments using Docker. A must have for your local development!
You can find DeKick's README either in the dekick/README.md or [here](https://git.desmart.com/desmart/dekick/-/blob/master/README.md).

## Stack
- Docker
- Node.js
- PostgreSQL

## Documentation
The API documentation is available [here](https://documenter.getpostman.com/view/98950/TzCP8o61).

## Commit messages
List of acceptable commit prefixes: `feat, fix, chore, ci, docs, style, refactor, perf, test`.

Checkout branch `e2e`, run `git pull` and switch back to the `develop` branch. Try to push the changes - you should see
a notice that develop is being pushed to both branches. If this fails (`push rejected`) try `git push --force`. This
"hack" is needed only once, after that a simple push should work just fine.

## Request-response flow
[![](https://mermaid.ink/img/pako:eNptkU1vwjAMhv8KymmTgI52K9DDpCE47gLcKAeTuG20tukShw9B__sSOtA2LcrBfv34I_GZcSWQJSwr1YEXoKm3nqV1zx1jd7mGpuilzN1OE1IjJ6nqO7XET4uGBoPXpbKE-lu92k68vEshSjyAxsvbNbMDfjX4G1ih3kuOviY2ykhS-uSc-WzzMJ89bv8D8UibzeLomtZQ3nSz_cFiLTqn6-ZnW2uoTaZ0hdpclmgaVRvsIEezPnOBCqRw33P2csqowApTljhTgP7w39I6zjYCCBfCT8qSDEqDfQaW1OpUc5aQtniD5hLco6s7VSoQ6JLOjE6NX0QuDbmSXNWZzL1udenkgqgxSRD48DCXVNjdkKsqMFL4rRX7aRzEYTyBMMJ4HMFLFAm-G00nWfg8ysT4aRQCa9v2C6Rhoes)](https://mermaid.live/edit#pako:eNptkU1vwjAMhv8KymmTgI52K9DDpCE47gLcKAeTuG20tukShw9B__sSOtA2LcrBfv34I_GZcSWQJSwr1YEXoKm3nqV1zx1jd7mGpuilzN1OE1IjJ6nqO7XET4uGBoPXpbKE-lu92k68vEshSjyAxsvbNbMDfjX4G1ih3kuOviY2ykhS-uSc-WzzMJ89bv8D8UibzeLomtZQ3nSz_cFiLTqn6-ZnW2uoTaZ0hdpclmgaVRvsIEezPnOBCqRw33P2csqowApTljhTgP7w39I6zjYCCBfCT8qSDEqDfQaW1OpUc5aQtniD5hLco6s7VSoQ6JLOjE6NX0QuDbmSXNWZzL1udenkgqgxSRD48DCXVNjdkKsqMFL4rRX7aRzEYTyBMMJ4HMFLFAm-G00nWfg8ysT4aRQCa9v2C6Rhoes)

## Known issues

When student sync with new live course, on test and beta environments there is a field `accessible_to` which has invalid value, in this specific case true data is stored in `metadata` field under the `expires_at` key. 
Have in mind, that we should monitor this on production (where it is working well) after release of MVP 3.

## Useful scripts

### `create:module`
Running `yarn create:module` will create a new module. The script will:
- create module dir in `src/modules`
- create example action file
- create route file (with example action attached)
- register routes in `src/server.ts`
- optional: create a model (`src/models`) and a migration (`migrations`)

### `create:action`
Running `yarn create:action` will create an action in the selected module. The script will:
- create an action file in the selected module
- register the action in `routes.ts`

### `create:crud`
Running `yarn create:crud` will create set of CRUD actions (or only selected actions) in the chosen module. The script will:
- create action files in the selected module
- register the actions in `routes.ts`
- create service and repository functions

### `ek:create:master-admin`
In order to create a *master admin* account, run `yarn api yarn ek:create:master-admin`. This command
launches the script in the context of the running container. On staging / production environment simply
run `yarn ek:create:master-admin`.

### `ek:create:layout`
Run `yarn api yarn ek:create:layout` to create a new exam layout. On staging / production environment
simply run `yarn ek:create:layout`.

### `ek:create:default-exam-type`
Run `yarn api yarn ek:create:default-exam-type` to create a default exam type. On staging / production environment
simply run `yarn ek:create:default-exam-type`.

### `ek:seed-timers`
Run `yarn api yarn ek:seed-timers` to seed exam type metrics with default values (time average etc.). On staging / production environment
simply run `yarn ek:seed-timers`.

### `ek:drop-student-exams`
Run `yarn api yarn ek:drop-student-exams` to delete student exams with given IDs. On staging / production environment
simply run `yarn ek:drop-student-exams`.

### `ek:cron-debug`
Run `yarn api yarn ek:cron-debug` to dispatch a specific cron job (selected from the list). On staging / production environment
simply run `yarn ek:cron-debug`.

### `ek:percentile-rank`
Run `yarn api yarn ek:percentile-rank` to recalculate percentile ranks for each exam type. On staging / production environment
simply run `yarn ek:percentile-rank`.

### Copy database from test to local env
Please see the instructions in `scripts/database/copy-psql-db-from-test-to-local.py`

## Directory structure
```text
db/ - PostgreSQL database folder, generated upon project build
dist/ - transpiled TS files, generated upon project build
docker/ - Docker configuration
gitlab/ - Gitlab CI configuration (for staging environments)
migrations/ - database migrations
pm2/ - runtime configuration (e.g. development server)
scripts/ - scripts that can be executed manually (see: packagist.json)
services/ - services outside of the business logic (e.g. notification dispatcher)
src/ - source files of the application
  types/ - TS types used in various places in the application
utils/ - helper functions (e.g. object manipulation, string hashing)
```

## Module structure
A *module* is an area of business logic wrapped in code. Modules are stored in `src/modules/`. The example
below is based on the `admins` module. Modules will vary and their contents might be different. But this
is the common / shared structure.

```text
actions/ - actions attached to each route
  routes.ts - module's route definition
  admin-repository.ts - responsible for communication with the database
  admin-service.ts - responsible for domain-specific tasks (e.g. create account and dispatch email)
dto/ - DTOs helping maintain data integrity
validation/ - validation functions
  schema/ - request validation schemas (more info at https://joi.dev/)
```

## Unit tests
To execute unit tests run `yarn test`.
