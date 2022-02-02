#!/usr/bin/env bash

set -euo pipefail

ROOT=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)

while [[ $# -gt 0 ]]
do
    key="$1"
    case "$key" in
        -t|--template)
            tpl="$2"
            shift
            shift
            ;;
        -u|--username)
            username="${2}"
            shift
            shift
            ;;
        -d|--duration)
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

export ACCESS_DATE=$(date '+%Y-%m-%d-%H:%M:%S%z')
export USERNAME=${username}
export DURATION=${duration}
echo $USERNAME
echo $DURATION

cat $ROOT/_templates/${tpl}.tpl | envsubst > $ROOT/accessRequest/${ACCESS_DATE}-access.json
