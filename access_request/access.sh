#!/usr/bin/env bash

set -euo pipefail

ROOT=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)

while [[ $# -gt 0 ]]; do
    key="$1"
    case "$key" in
    -t | --template)
        tpl="$2"
        shift
        shift
        ;;
    -u | --username)
        username="${2}"
        shift
        shift
        ;;
    -d | --duration)
        duration="${2}"
        shift
        shift
        ;;
    *)
        echo "unknown option: ${key}"
        exit 1
        ;;
    esac
done

tpl=${tpl:-"access"}
if [[ -z ${username+guard} ]]; then
    echo "aws account username must be specified through -u|--username"
    exit 1
fi
if [[ -z ${duration+guard} ]]; then
    echo "expected duration for access in seconds must be  specified through -d|--duration"
    exit 1
fi

echo "Please select reason for access from the following"
options=("Pager" "jira_ticket" "bugfix" "Restart_service/Pod" "quit")
select opt in "${options[@]}"; do
    case $opt in
    "Pager")
        break
        ;;
    "jira_ticket")
        break
        ;;
    "bugfix")
        break
        ;;
    "Restart_service/Pod")
        break
        ;;
    "quit")
        break
        ;;
    *) echo "invalid option $REPLY" ;;
    esac
done

export ACCESS_DATE=$(date '+%Y-%m-%d-%H:%M:%S%z')
export USERNAME=${username}
export DURATION=${duration}
export REASON=$opt
echo $USERNAME
echo $DURATION
echo $REASON

cat $ROOT/_templates/${tpl}.tpl | envsubst >$ROOT/accessRequest/${ACCESS_DATE}-access.json
