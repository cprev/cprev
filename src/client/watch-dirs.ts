'use strict';

import Timer = NodeJS.Timer;
import * as fs from 'fs';
import log from "bunion";
import * as net from "net";
import {getConnection} from "./agent";
import {ChangePayload, WatchDir} from "../types";
import * as cp from 'child_process';

const doWrite = (s: net.Socket, v: ChangePayload) => {
  s.write(JSON.stringify({val: v}) + '\n');
};

export const watchDirs = (dirs: Array<WatchDir>) => {

  let watchCount = 0;

  const timers = new Map();

  for (const i of dirs) {
    fs.watch(i.dirpath, (event: string, filename: string) => {

      log.info('filesystem event:', event, filename);

      //we have a timer for each file
      clearTimeout(timers.get(filename));
      timers.set(filename, setTimeout(() => {

        if (i.git_repo) {
          return getConnection().then(v => {
            doWrite(v, {
              repo: i.git_repo,
              file: filename,
              user_email: 'alex@oresoftware.com',
              user_name: 'alex'
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
          if (code && code > 0) {
            log.error('git/bash child process exited with non zero code.');
            log.error(d.stderr);
            return;
          }

          if(!(d.stdout && d.stdout.startsWith('/'))){
            return;
          }

          try{
            var stats = fs.statSync(d.stdout);
          }
          catch(err){
            log.error('Could not stat this path:', d.stdout);
            return;
          }

          if(!stats.isDirectory()){
            log.error('The stats call says this is not a git dir:', d.stdout);
            return;
          }

          getConnection().then(v => {
            doWrite(v, {
              repo: i.git_repo,
              file: filename,
              user_email: 'alex@oresoftware.com',
              user_name: 'alex'
            });
          });

        });

      }, 2500));
    });
  }

};
