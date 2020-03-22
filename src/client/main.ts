#!/usr/bin/env node
'use strict';

import log from "bunion";
import * as fs from "fs";
import {localAgentSocketPath} from "../constants";
import * as path from "path";
import {agentTcpServer} from './agent-tcp-server'
import {getWatchableDirs} from "./get-watchable-dirs";

import config from '../.cprev.conf.js';
import {watchDirs} from "./watch-dirs";

export type Config = typeof config

getWatchableDirs(config, (err, dirs) => {

  if (err) {
    log.error('4585a17b-a478-4ba0-beca-c0702d0983ea:', err);
    process.exit(1);
  }

  log.error('2222',err, dirs);

  if (!(dirs && dirs.length > 0)) {
    log.error('cfe59e4a-8b5c-4cfd-ab7d-6fdec27e39a6:', `No folders to watch - add a ".cprev.js" file to folders within your "codeRoots" property in ".cprev.conf.js"`);
    process.exit(1);
  }

  watchDirs(dirs);
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
