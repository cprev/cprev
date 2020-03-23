#!/usr/bin/env node
'use strict';

import log from "bunion";
import * as fs from "fs";
import {ignorePathsRegex, localAgentSocketPath} from "../constants";
import * as path from "path";
import {agentTcpServer} from './agent-tcp-server'
import {getWatchableDirs} from "./get-watchable-dirs";

import config from '../.cprev.conf.js';
import {watchDirs} from "./watch-dirs";
import {mkdirSafe} from "../utils";
import Timer = NodeJS.Timer;

export type Config = typeof config

const rootDirs = config.codeRoots;

getWatchableDirs(rootDirs, ignorePathsRegex, (err, dirs) => {

  if (err) {
    log.error('4585a17b-a478-4ba0-beca-c0702d0983ea:', err);
    process.exit(1);
  }

  if (!(dirs && dirs.length > 0)) {
    log.error('cfe59e4a-8b5c-4cfd-ab7d-6fdec27e39a6:',
      `No folders to watch - add a ".cprev.js" file to folders within your "codeRoots" property in ".cprev.conf.js"`);
    process.exit(1);
  }

  watchDirs(dirs);
});


const mydirs = [
  path.resolve(process.env.HOME + '/.cprev'),
  path.resolve(process.env.HOME + '/.cprev/conf')
];

for(const d of mydirs){
  mkdirSafe(d);
}

getWatchableDirs(mydirs, [new RegExp('/.cprev/lib/')], (err, dirs) => {

  if(err){
    log.error(err);
    log.fatal('Could not watch the following dirs:', dirs);
  }

  let to  = <Timer><unknown>null;
  for (const i of dirs) {

    fs.watch(i.dirpath, (event: string, filename: string) => {

      clearTimeout(to);

      to = setTimeout(() => {
        log.info('Config file changed, restarting.');
        process.exit(0);
      }, 800);

    });

  }
});



try {
  fs.unlinkSync(localAgentSocketPath)
}
catch (err) {
  log.warn('Could not unlink file:', localAgentSocketPath);
}

try {
  fs.mkdirSync(path.dirname(localAgentSocketPath), {recursive: true});
}
catch (err) {
  log.warn('Could not create dir:', path.dirname(localAgentSocketPath));
  // process.exit(1);
}

agentTcpServer.listen(localAgentSocketPath, () => {
  log.info('agent socket server listening on path:', localAgentSocketPath);
});

process.once('SIGTERM', () => {

  setTimeout(() => {
    log.warn('server close timed out.');
    process.exit(1);
  }, 2000);

  agentTcpServer.close(() => {
    process.exit(1)
  });
});

process.once('SIGINT', () => {

  setTimeout(() => {
    log.warn('server close timed out.');
    process.exit(1);
  }, 2000);

  agentTcpServer.close(() => {
    process.exit(1)
  });

});
