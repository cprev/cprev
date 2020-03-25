#!/usr/bin/env bash


set +eo pipefail;

export cprev_user_uuid=333

(
    set -e;

    command -v node || echo 'no node installed'
    command -v nvm || echo 'no nvm installed'

    current_node_version="$(node --version 2> /dev/null || echo)"

    if [[ "$current_node_version" != 'v13.11'* ]]; then
      echo 'Installing nvm in order to install nodejs...'
      (PROFILE=/dev/null curl -o- 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh' | bash) &> /dev/null
      exit_code="$?"
      if [[ "$exit_code" != '0' ]]; then
         echo 'Could not install node via nvm' > /dev/stderr;
         exit 1;
      fi

      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

       echo 'Installing nodejs v13.11 via nvm...'
       nvm install '13.11'   # &&   nvm use '13.11'
    fi


    node "$HOME/.local/bin/cprev-agent"
)

exit_code="$?"

echo "cprev agent is exiting with code: '$exit_code'"
exit "$exit_code";
