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
import {getGitRemotes, getGitRepoPath} from "../utils";

const doWrite = (s: net.Socket, v: SocketMessage) => {

  if (!s.writable) {
    log.warn('44558c07-2b13-4f9c-9f3c-7e524e11fe07: socket is not writable.');
    return;
  }

  if(!(v && typeof v === 'object')){
    log.warn('payload is not an object:', v);
    return;
  }

  if(v.resUuid){
    log.warn('refusing to write to socket since payload has resUuid property:', v);
    return;
  }

  log.info("fb224b51-bb55-45d3-aa46-8f3d2c6ce55d writing payload:", v);
  s.write(JSON.stringify(v) + '\n', 'utf8');
};
//
const hasGitGrandparent = (pth: string): boolean => {
  const dirname = path.dirname(pth);
  if (dirname.endsWith('/.git')) {
    return true;
  }
  if (dirname === pth) {
    return false;
  }
  return hasGitGrandparent(dirname);
};

const updateForGit = (p: GitPayload) => {

  const id = uuid.v4();

  getConnection().then(s => {
    doWrite(s, {
      type: 'git',
      reqUuid: id,
      val: p
    });
  });

  return new Promise((resolve) => {

    let timedout = false;
    const to = setTimeout(() => {
      timedout = true;
      cache.resolutions.delete(id);
      resolve(null);
    }, 1500);

    cache.resolutions.set(id, () => {
      cache.resolutions.delete(id);
      if (timedout) {
        return;
      }
      clearTimeout(to);

      resolve(null);
    });

  });
};

export const watchedDirs = new Set<string>();
export const dirToWatcher = new Map<string, FSWatcher>();

export const watchDirs = (dirs: Array<WatchDir>) => {

  const timers = new Map();

  console.log('dirs.length:', dirs.length);
  for (let v of dirs) {
    log.info(v);
  }

  for (const i of dirs) {

    let p: Promise<any> = Promise.resolve();

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
      if (timers.has(fullPath)) {
        clearTimeout(timers.get(fullPath));
      }

      const now = Date.now();

      timers.set(fullPath, setTimeout(() => {

        return p = p.then(() => {

          return getGitRepoPath(i.dirpath)
            .then(v => {

              console.log('result::', v); //

              if (String(v || '').trim() === '') {
                return null;
              }

              return getGitRemotes(i.dirpath).then(remotes => {
                return {
                  git_repo: v,
                  remotes
                }
              })
            })
            .then(v => {

              if (v === null) {
                log.warn('the following file does not appear to be within a git repo:', fullPath);
                return;
              }

              log.info('updating for git:', v); //

              return updateForGit({
                repo_path: v.git_repo,
                remote_urls: v.remotes,
                branch: null as any,
                trackedFiles: null as any
              })
                .then(() => {
                  return getConnection().then(s => {
                    doWrite(s, {
                      type: event === 'change' ? 'change' : 'read',
                      reqUuid: uuid.v4(),
                      val: {
                        repo: i.git_repo,
                        repo_remotes: v.remotes,
                        file: fullPath,
                        user_email: 'alex@oresoftware.com',
                        user_name: 'alex'
                      }
                    });
                  });
                });

            });
        });

        /// old colde
        if (i.git_repo) {
          return getConnection().then(v => {
            doWrite(v, {
              type: event === 'change' ? 'change' : 'read',
              reqUuid: uuid.v4(),
              val: {
                repo: i.git_repo,
                repo_remotes: [], // TODO fill this in
                file: fullPath,
                user_email: 'alex@oresoftware.com',
                user_name: 'alex'
              }
            });
          });
        }

        const k = cp.spawn('bash');

        k.stdin.end(`
           cd "$(dirname "${filename}")" && git rev-parse --show-toplevel
        `);

        const d = {
          stdout: '',
          stderr: ''
        };

        k.stderr.on('data', d => {
          d.stderr = String(d || '').trim();
        });

        k.stdout.on('data', d => {
          d.stdout = String(d || '').trim();
        });

        k.once('exit', code => {
          ///

          if (code && code > 0) {
            log.error('33e68dd9-5842-41c2-83e0-65d43e68cb27: git/bash child process exited with non zero code.');
            log.error('058b717c-94a3-49a9-b6e3-a162beb9d96b: stderr:', d.stderr);
            return;
          }

          if (!(d.stdout && d.stdout.startsWith('/'))) {
            log.warn('715b9f6e-7119-43ae-9a02-9b0c8c1f52dc: Not a filepath:', d.stdout);
            return;
          }

          try {
            var stats = fs.statSync(d.stdout);
          }
          catch (err) {
            log.error('8781b643-b682-4e0b-a29b-931ce7df7376: Could not stat this path:', d.stdout);
            return;
          }

          if (!stats.isDirectory()) {
            log.error('954d918f-826f-4524-a7e0-683ea32e4208: The stats call says this is not a git dir:', d.stdout);
            return;
          }

          getConnection().then(v => {
            doWrite(v, {
              type: event === 'change' ? 'change' : 'read',
              reqUuid: uuid.v4(),
              val: {
                repo: i.git_repo,
                file: fullPath,
                repo_remotes: [], // TODO fill this in
                user_email: 'alex@oresoftware.com',
                user_name: 'alex'
              }
            });

          });

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
