#!/usr/bin/env bash

while true; do
   sleep 5;
   timeout 30 inotifywait -e modify /tmp/cprev.stdout.log | while read line; do
      lines="$(tail /tmp/cprev.stdout.log)"
      echo "$lines" > /tmp/cprev.stdout.log
   done;
done;
