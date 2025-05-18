#!/bin/bash
rupgradeall
rexec web "./$RANCHER_CONFIG_DIR/ci-after-deploy.sh"
stack-add "$CI_ENV" "$CI_PROJECT_NAMESPACE"
waitforurl "https://${HOSTNAME}/healthcheck?HEALTHCHECK_KEY=$HEALTHCHECK_KEY" -t 300
echo "Successfully deployed app to https://$HOSTNAME"