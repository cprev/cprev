#!/usr/bin/env bash

if ! command -v node; then
   echo 'node is not installed.'
   exit 1;
fi

node "$HOME/.local/bin/cprev-agent"

