#!/usr/bin/env bash

if [[ $EUID -eq 0 ]]; then
   echo 'Refusing to install cprev as root user.'
   exit 1
fi

if [[ "cprev_allow_reinstall" == 'yes' ]]; then
    if [[ -d "$HOME/.cprev/conf" ]]; then
      echo 'Refusing to overwrite existing cprev installation.';
      echo 'Use "export cprev_allow_reinstall=yes" to overwrite current installation.';
      exit 1;
    fi

    if [[ -d "$HOME/.cprev/lib" ]]; then
      echo 'Refusing to overwrite existing cprev installation.';
      echo 'Use "export cprev_allow_reinstall=yes" to overwrite current installation.';
      exit 1;
    fi
fi

rm -rf "$HOME/.cprev"

mkdir -p "$HOME/.cprev/conf"
mkdir -p "$HOME/.cprev/lib"
mkdir -p "$HOME/.cprev/sockets"

cd "$HOME/.cprev"
git clone 'git@github.com:cprev/cprev.git' "$HOME/.cprev/lib"

cd "$HOME/.cprev/lib" && git checkout master

ln -sf "$HOME/.cprev/lib/dist/client/main.js" "$HOME/.local/bin/cprev-agent"
chmod +x "$HOME/.local/bin/cprev-agent"


ln -sf "$HOME/.cprev/lib/install/linux/start.sh" "$HOME/.local/bin/cprev-safe-start"
chmod +x "$HOME/.local/bin/cprev-safe-start"
