#!/usr/bin/env bash

set -eo pipefail;

run_command(){

  file_to_run="$1";

  if command -v curl; then
     echo 'this is curl'
     exit;
  fi

  if command -v wget; then
     echo 'this is wget'
     exit;
  fi

  echo 'Both curl and wget commands are unavailable.';
  exit 1;
}

if [[ "$OSTYPE" == "linux-gnu" ]]; then
       exit;
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac OSX
       exit;
fi

if [[ "$OSTYPE" == "cygwin" ]]; then
        # POSIX compatibility layer and Linux environment emulation for Windows
      exit;
fi

if [[ "$OSTYPE" == "msys" ]]; then
      # Lightweight shell and GNU utilities compiled for Windows (part of MinGW)
      exit;
fi

if [[ "$OSTYPE" == "win32" ]]; then
      # I'm not sure this can happen.
      exit;
fi

if [[ "$OSTYPE" == "freebsd"* ]]; then
        # ...
       exit;
fi


echo 'Unknown operating system, please report this lulz.';
exit 1;
