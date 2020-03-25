#!/usr/bin/env bash

set -eo pipefail;

if [[ $EUID -eq 0 ]]; then
   echo 'Refusing to install cprev as root user.'
   exit 1
fi

rm -rf "$HOME/.cprev"
mkdir -p "$HOME/.cprev/conf"
mkdir -p "$HOME/.cprev/sockets"

(

  if [[ ! -d '.git' ]]; then
     echo 'Did not cd into correct directory, we are here:' "$PWD";
     exit 1;
  fi

  if [[ ! -f 'readme.md' ]]; then
     echo 'Did not cd into correct directory, we are here:' "$PWD";
     exit 1;
  fi

  ln -sf "$PWD" "$HOME/.cprev/lib"
)

mkdir -p "$HOME/.local/bin"

ln -sf "$HOME/.cprev/lib/dist/client/main.js" "$HOME/.local/bin/cprev-agent"
chmod +x "$HOME/.local/bin/cprev-agent"

ln -sf "$HOME/.cprev/lib/install/macos/start.sh" "$HOME/.local/bin/cprev-safe-start"
chmod +x "$HOME/.local/bin/cprev-safe-start"


#sudo rsync "$PWD/systemd.service" "/etc/systemd/system/cprev.agent.service"

rm -f "$HOME/Library/LaunchAgents/org.ores.cprev.plist" || echo 'no rm necessary'

rsync "$PWD/install/macos/org.ores.cprev.plist" "$HOME/Library/LaunchAgents/org.ores.cprev.plist"

node install/macos/write-config.js
echo 'installed successfully (local installation).';

echo 'To restart the systemd service, use:'
echo 'launchctl load "$HOME/Library/LaunchAgents/org.ores.cprev.plist"'
