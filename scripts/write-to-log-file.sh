#!/usr/bin/env bash

while true; do
   sleep 1;
   echo "$(uuidgen)"  >> /tmp/cprev.stdout.log
done;
