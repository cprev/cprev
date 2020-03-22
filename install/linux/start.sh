#!/usr/bin/env bash

set -eo pipefail;

(
    current_node_version="$(node --version 2> /dev/null)"

    if [[ "$current_node_version" != v13* ]]; then
      echo 'Installing nvm in order to install nodejs...'
      (PROFILE=/dev/null curl -o- 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh' | bash) &> /dev/null
      exit_code="$?"
      if [[ "$exit_code" != '0' ]]; then
         echo 'Could not install node via nvm' > /dev/stderr;
         exit 1;
      fi

      export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

       echo 'Installing nodejs v13.11 via nvm...'
       nvm install '13.11'   # &&   nvm use '13.11'
    fi


    node "$HOME/.local/bin/cprev-agent"
)
