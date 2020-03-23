#!/usr/bin/env bash

if [[ $EUID -e 0 ]]; then
   echo 'Refusing to install cprev as root user.'
   exit 1
fi

mkdir -p
