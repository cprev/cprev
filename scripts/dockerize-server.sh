#!/usr/bin/env bash

set -eo pipefail;
cd "$(dirname "$(dirname "$BASH_SOURCE")")"

tsc # transpile it all

set +e;

handle_empty(){
  while read line; do
    linein="$(echo "$line" | sed 's/ //g')"  # get rid of whitespace
    if [[ -z "$linein" ]]; then
        echo 'There was an empty line, exiting.' > /dev/stderr; exit 0;
    fi
    echo "$line"
  done;
}

export -f handle_empty;

is_darwin=`test 'Darwin' == "$(uname -s)" && echo 'yes'`

r_flag='-r';

if test "$is_darwin" == 'yes'; then
  r_flag=""
fi

# remove all unused / orphaned images
echo -e  "Removing unused images..."
docker images --no-trunc | grep "<none>" | awk "{print \$3}"  | xargs "$r_flag" docker rmi -f | cat;


# clean up stuff -> using these instructions https://lebkowski.name/docker-volumes/
echo -e  "Cleaning up old containers..."
docker ps --filter status=dead --filter status=exited -aq  | xargs "$r_flag" docker rm -v | cat;


echo -e  "Cleaning up old volumes..."
docker volume ls -qf dangling=true  | xargs "$r_flag" docker volume rm | cat;


echo -e 'Cleaning up old networks...'
docker network ls --format "{{json . }}" | jq -r '.Name' | while read name; do
     if test "$name" == "interos-test"*; then
        docker network rm "$name" | cat
     fi
done

curr_uuid="$(uuidgen)"

(
 docker stop 'cprev-server' || echo
 docker rm 'cprev-server' || echo
 docker stop 'cprev-agent-1' || echo
 docker rm 'cprev-agent-1' || echo
 docker stop 'cprev-agent-2' || echo
 docker rm 'cprev-agent-2' || echo
) &


(
  rm -rf build/tmp
  rsync -r  --exclude='.git' --exclude='node_modules' --exclude='src' --exclude='.circleci' ./ build/tmp
  rsync -r  --exclude='.git' --exclude='node_modules' --exclude='src' --exclude='.circleci' ./docker/server/ build/tmp
  ls -a build/tmp
  cd build/tmp
  docker build -t "cprev-server:$curr_uuid" .
)


(
  rm -rf build/tmp
  rsync -r  --exclude='.git' --exclude='node_modules' --exclude='src' --exclude='.circleci' ./ build/tmp
  rsync -r  --exclude='.git' --exclude='node_modules' --exclude='src' --exclude='.circleci' ./docker/agent/ build/tmp
  ls -a build/tmp
  cd build/tmp
  docker build -t "cprev-agent:$curr_uuid" .
)

wait;

docker network rm cprev || echo;
docker network create cprev || echo;

docker run --rm -d -e cprev_host='0.0.0.0' \
    --network=host --name 'cprev-server' "cprev-server:$curr_uuid"

sleep 3

docker run --rm -d -e cprev_host='0.0.0.0' -e cprev_test_folder='/app' \
    -e cprev_user_uuid=111 --network=host --name 'cprev-agent-1' "cprev-agent:$curr_uuid"

docker run --rm -d -e cprev_host='0.0.0.0' -e cprev_test_folder='/app' \
    -e cprev_user_uuid=222 --network=host --name 'cprev-agent-2' "cprev-agent:$curr_uuid"

(
    docker logs -f cprev-server &
    docker logs -f cprev-agent-1 &
    docker logs -f cprev-agent-2 &
) | cat &

kill_pid="$?"

sleep 8;

echo 'running the touch..';
docker exec -d 'cprev-agent-1' touch /app/entrypoint.sh
docker exec -d 'cprev-agent-2' touch /app/entrypoint.sh

sleep 6;
kill -9 "$kill_pid"
