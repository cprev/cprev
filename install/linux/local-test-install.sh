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

mkdir -p "$HOME/.config/systemd/user"


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


#sudo rsync "$PWD/systemd.service" "/etc/systemd/system/cprev.agent.service"
rsync "$PWD/systemd.service" "$HOME/.config/systemd/user/cprev.agent.service"


node write-config.js

systemctl --user daemon-reload
systemctl --user enable cprev.agent.service
systemctl --user restart cprev.agent.service

echo 'installed successfully (local installation).';

echo 'Useful systemd commands for this service, are:'
echo
echo 'systemctl --user daemon-reload'
echo 'systemctl --user restart cprev.agent.service'
echo 'systemctl --user enable cprev.agent.service'
echo 'journalctl -f --user -u cprev.agent.service'
