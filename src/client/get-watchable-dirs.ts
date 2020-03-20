'use strict';

import * as async from 'async';
import {Config} from "./main";
import {ResultCallback, WatchDir} from "../types";
import * as path from 'path';
import log from "bunion";
import * as fs from 'fs';
import {ignoredPaths, ignorePathsRegex} from "../constants";
import {dir} from "async";

export const flattenDeep = (a: Array<any>): Array<any> => {
  return a.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
};

export type EVCb<T, E = any> = (err?: E, val?: T) => void;

type Task = (cb: EVCb<any>) => void;

export const getWatchableDirs = (config: Config, cb: EVCb<Array<WatchDir>>) => {

  const paths = flattenDeep([config.codeRoots]).map(v => path.resolve(v));

  const uniquePaths = Array.from(new Set(paths));

  const q = async.queue<Task>((task, cb) => task(cb), 15);

  const alreadySeen = new Set<string>();
  const uniqueFolders = new Set<WatchDir>();

  const goThroughDir = (dir: string, isWatchingNow: boolean, relevantGitRepo: string) => {

    if (alreadySeen.has(dir)) {
      return process.nextTick(cb);
    }

    alreadySeen.add(dir);

    for (let ignore of ignorePathsRegex) {
      if (ignore.test(path.resolve(dir + '/'))) {
        return process.nextTick(cb);
      }
    }

    q.push(cb => {

      fs.stat(dir, (err, stats) => {

        if (err) {
          log.warn('7ae3f105-a04e-406f-846c-2a45f8515c1b:', err);
          return cb(null);
        }

        if (!stats.isDirectory()) {
          return cb(null);
        }

        if (alreadySeen.has(dir)) {
          return cb(null);
        }

        alreadySeen.add(dir);

        try {
          var cprevjs = require(path.resolve(dir + '/.cprev.js'));
          isWatchingNow = true;
        }
        catch (err) {

        }

        const potentialGitFolder = path.resolve(dir + '/.git');

        fs.stat(potentialGitFolder, (err, stats) => {

          if (stats && stats.isDirectory()) {
            relevantGitRepo = potentialGitFolder
          }

          if (isWatchingNow) {
            uniqueFolders.add({dirpath: dir, git_repo: relevantGitRepo});
          }

          fs.readdir(dir, (err, results) => {

            cb(null);

            if (err) {
              log.warn('bb97184f-4a07-4acd-b7bc-59dc8e5fb0e4:', err);
              return cb(null);
            }

            for (const v of results) {
              goThroughDir(path.resolve(dir + '/' + v), isWatchingNow, relevantGitRepo);
            }

          });

        });

      });

    })

  };

  q.error(err => {
    log.error(err);
  });

  q.drain(() => {
    cb(null, Array.from(uniqueFolders));
  });

  for (const p of uniquePaths) {
    goThroughDir(
      p,
      false,
      path.normalize('/tmp/unknown/git/repo/path')
    );
  }

};
