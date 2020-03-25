#!/usr/bin/env bash

set -eo pipefail;
cd "$(dirname "$BASH_SOURCE")"

if [[ $EUID -eq 0 ]]; then
   echo 'Refusing to install cprev as root user.'
   exit 1
fi

rm -rf "$HOME/.cprev"

mkdir -p "$HOME/.cprev/conf"
mkdir -p "$HOME/.cprev/sockets"


(
  cd "$(dirname "$(dirname "$(dirname "$BASH_SOURCE")")")";

  if [[ ! -d .git ]]; then
     echo 'Did not cd into correct directory.';
     exit 1;
  fi

  ln -sf "$PWD" "$HOME/.cprev/lib"
)


mkdir -p "$HOME/.local/bin"

ln -sf "$HOME/.cprev/lib/dist/client/main.js" "$HOME/.local/bin/cprev-agent"
chmod +x "$HOME/.local/bin/cprev-agent"

ln -sf "$HOME/.cprev/lib/install/linux/start.sh" "$HOME/.local/bin/cprev-safe-start"
chmod +x "$HOME/.local/bin/cprev-safe-start"


sudo rsync "$PWD/systemd.service" "/etc/systemd/system/cprev.agent.service"

node write-config.js

echo 'installed successfully (local installation).';

echo 'To restart the systemd service, use:'
echo 'systemctl restart cprev.agent.service'
