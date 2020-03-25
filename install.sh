#!/usr/bin/env bash

set -eo pipefail;

run_command(){

  file_to_run="$1";

  if command -v curl; then
     curl -o- "$" | bash
     exit;
  fi

  if command -v wget; then
     echo 'this is wget'
     wget -qO- "$1" | bash
     exit;
  fi

  echo 'Both curl and wget commands are unavailable.';
  exit 1;
}

base_url='https://raw.githubusercontent.com/cprev/cprev/master/install'


if [[ "$OSTYPE" == "linux-gnu" ]]; then
       run_command "$base_url/linux/install.sh"
       exit;
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac OSX
       run_command "$base_url/macos/install.sh"
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
