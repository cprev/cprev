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

  const timers = new Map();

  for (const i of dirs) {
    fs.watch(i.dirpath, (event: string, filename: string) => {

      log.info('filesystem event:', event, filename);

      //we have a timer for each file
      if(timers.has(filename)){
        clearTimeout(timers.get(filename));
      }

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
          ///

          if (code && code > 0) {
            log.error('33e68dd9-5842-41c2-83e0-65d43e68cb27: git/bash child process exited with non zero code.');
            log.error('058b717c-94a3-49a9-b6e3-a162beb9d96b: stderr:',d.stderr);
            return;
          }

          if(!(d.stdout && d.stdout.startsWith('/'))){
            log.warn('715b9f6e-7119-43ae-9a02-9b0c8c1f52dc: Not a filepath:', d.stdout);
            return;
          }

          try{
            var stats = fs.statSync(d.stdout);
          }
          catch(err){
            log.error('8781b643-b682-4e0b-a29b-931ce7df7376: Could not stat this path:', d.stdout);
            return;
          }

          if(!stats.isDirectory()){
            log.error('954d918f-826f-4524-a7e0-683ea32e4208: The stats call says this is not a git dir:', d.stdout);
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
