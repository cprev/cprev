#!/usr/bin/env bash

if [[ $EUID -e 0 ]]; then
   echo 'Refusing to install cprev as root user.'
   exit 1
fi

if [[ -d "$HOME/.cprev/conf" ]]; then
  echo 'Refusing to overwrite existing cprev installation.';
  echo 'Use "export cprev_reinstall=yes" to overwrite current installation.';
  exit 1;
fi

if [[ -d "$HOME/.cprev/lib" ]]; then
  echo 'Refusing to overwrite existing cprev installation.';
  echo 'Use "export cprev_reinstall=yes" to overwrite current installation.';
  exit 1;
fi

if [[ -d "$HOME/.cprev" ]]; then
  echo 'Refusing to overwrite existing cprev installation.';
  echo 'Use "export cprev_reinstall=yes" to overwrite current installation.';
  exit 1;
fi

rm -rf "$HOME/.cprev"

mkdir -p "$HOME/.cprev/conf"
mkdir -p "$HOME/.cprev/lib"

cd "$HOME/.cprev"
git clone 'git@github.com:cprev/cprev.git' "$HOME/.cprev/lib"

cd "$HOME/.cprev/lib" && git checkout master

ln -sf "$HOME/.cprev/lib/dist/client/main.js" "/usr/local/bin/cprev-agent"


