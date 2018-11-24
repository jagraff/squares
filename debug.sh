#!/usr/bin/env bash
set -e
trap 'kill $(jobs -p)' EXIT
nodemon index.js &
PID1=$!
livereload &
PID2=$!
wait ${PID2}
wait ${PID1}