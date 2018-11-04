#!/usr/bin/env bash
trap 'kill $(jobs -p)' EXIT
nodemon index.js &
PID1=$!
livereload &
PID2=$!
wait
