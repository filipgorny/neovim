#
# Script to restore test_db state on local one
#
# In order for the script to work properly make sure you have completed following steps:
#   1. Install and set up Docker and Python 3 on your local machine
#   !! Make sure the alias "python" points to the proper Python3.x version
#   2. Install package manager "poetry"
#     "curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/install-poetry.py | python"
#   3. Set alias for poetry
#     "alias poetry="$HOME/.local/bin/poetry"
#   4. Run "poetry install --no-root" to install all dependencies
#   5. Set .env file with following properties:
#     - Local Database
#       * DB_PORT
#       * DB_USER
#       * DB_PASSWORD
#       * DB_DATABASE
#     - Test Database
#       * DB_TEST_HOST
#       * DB_TEST_PORT
#       * DB_TEST_USER
#       * DB_TEST_PASSWORD
#       * DB_TEST_DATABASE
#   6. Run script with following command:
#     poetry run python scripts/database/copy-psql-db-from-test-to-local.py
#

import os
from decouple import config

# setting variables for test_db connection
DB_TEST_PASSWORD = config('DB_TEST_PASSWORD', default = None)
DB_TEST_HOST = config('DB_TEST_HOST', default = None)
DB_TEST_PORT = config('DB_TEST_PORT', default = None)
DB_TEST_DATABASE = config('DB_TEST_DATABASE', default = None)
DB_TEST_USER = config('DB_TEST_USER', default = None)

# setting variables for local_db connection
DB_PASSWORD = config('DB_PASSWORD', default = None)
DB_HOST = '0.0.0.0'
DB_USER = config('DB_USER', default = None)
DB_DATABASE = config('DB_DATABASE', default = None)
DB_PORT = config('DB_PORT', default = None)

# check if all credentials for test_db are set
if None in (
  DB_TEST_PASSWORD,
  DB_TEST_HOST,
  DB_TEST_PORT,
  DB_TEST_DATABASE,
  DB_TEST_USER
):
  print('env file is incomplete, check all the credentials for test_db environment')
  exit()

# check if all credentials for local_db are set
if None in (
  DB_PASSWORD,
  DB_HOST,
  DB_USER,
  DB_DATABASE,
  DB_PORT
):
  print('env file is incomplete, check all the credentials for local_db environment')
  exit()

# check if all credentials for test_db are set
PG_PASS = f"echo '*:*:{DB_TEST_DATABASE}:{DB_TEST_USER}:{DB_TEST_PASSWORD}' > .pgpass; echo '*:*:{DB_DATABASE}:{DB_USER}:{DB_PASSWORD}' >> .pgpass; chmod og-rwx .pgpass"
PG_IMAGE = 'postgres:12.1-alpine' # define postgres version
DOCKER = f"docker run --network host --privileged --rm -w=/root --entrypoint /bin/sh {PG_IMAGE} -c"

try:
  print(f"Dumping database {DB_TEST_DATABASE} from {DB_TEST_HOST} to host {DB_HOST}, database {DB_DATABASE}")

  # run pg_restore command inside of a docker container
  os.system(f"{DOCKER} \"{PG_PASS}; pg_dump -h {DB_TEST_HOST} -p {DB_TEST_PORT} -d {DB_TEST_DATABASE} -U {DB_TEST_USER} -Fc | pg_restore --clean -h {DB_HOST} -p {DB_PORT} -U {DB_USER} -d {DB_DATABASE}\"")

  print('Database copied')
except:
  print('Check if you are connected with Areda VPN')
