'use strict';

import Timer = NodeJS.Timer;
import * as fs from 'fs';
import log from "bunion";
import * as net from "net";
import {getConnection} from "./client-conn";
import {ChangePayload, GitPayload, ReadPayload, SocketMessage, WatchDir} from "../types";
import * as cp from 'child_process';
import * as path from "path";
import {dir} from "async";
import * as uuid from 'uuid';
import {cache} from "./agent";
import {FSWatcher} from "fs";
import {getGitRemotes, getGitRepoPath, hasGitGrandparent} from "../utils";
import config from '../.cprev.conf.js';
import {handleChangeWithServer} from "./handle-change-with-server";

//

export const watchedDirs = new Set<string>();
export const dirToWatcher = new Map<string, FSWatcher>();

const network = 'network:';
const local = 'local:';

export const watchDirs = (dirs: Array<WatchDir>) => {

  const timers = new Map();

  console.log('dirs.length:', dirs.length);
  for (let v of dirs) {
    log.info(v);
  }

  for (const i of dirs) {

    let p1: Promise<any> = Promise.resolve();
    let p2: Promise<any> = Promise.resolve();

    const w = fs.watch(i.dirpath);

    w.on('change', (event: string, filename: string) => {

      const fullPath = path.resolve(i.dirpath + '/' + filename);

      if (hasGitGrandparent(fullPath)) {
        // p = p.then(() => updateForGit(fullPath));
        log.warn('This file/dir is within a ".git" dir?:', fullPath);
        return;
      }

      log.info('filesystem event:', event, fullPath);

      //we have a timer for each file
      if (timers.has(network + fullPath)) {
        clearTimeout(timers.get(network + fullPath));
      }

      if (timers.has(local + fullPath)) {
        clearTimeout(timers.get(local + fullPath));
      }

      const now = Date.now();

      timers.set(local + fullPath, setTimeout(() => {
        return p2 = p2.then(() => {
          return handleChangeWithServer(event, i, fullPath, filename);
        });
      }, 3000));

      timers.set(network + fullPath, setTimeout(() => {

        return p1 = p1.then(() => {
          return handleChangeWithServer(event, i, fullPath, filename);
        });

      }, 2500)); //
    });

    w.once('close', () => {
      watchedDirs.delete(i.dirpath);
      w.removeAllListeners();
    });

    w.once('error', err => {
      log.warn('dir watching error:', err, 'at path:', i.dirpath);
      w.close();
    });

    dirToWatcher.set(i.dirpath, w);
  }

};
