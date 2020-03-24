'use strict';

import * as fs from 'fs';
import * as cp from 'child_process';
import log from "bunion";


export const flattenDeep = (a: Array<any>): Array<any> => {
  return a.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
};


export const mkdirSafe = (dir: string) => {
  try{
    fs.mkdirSync(dir)
  }
  catch(err){
     //ignore
  }

};

// git rev-parse --show-toplevel

export const getGitRepoPath = (dirPath: string) : Promise<string> => {

  log.info('the dirpath:', dirPath); //

  return new Promise((resolve) => {

    const k = cp.spawn('bash');
    const cmd = `cd "${dirPath}" && git rev-parse --show-toplevel`;
    k.stdin.end(cmd);
    const result = {
      stdout: ''
    };

    k.stdout.on('data', d => {
      result.stdout += String(d || '').trim();
    });

    ////////

    k.once('exit', code => {
      if (code && code > 0) {
        log.warn(`Process (with cmd: '${cmd}') exited with code greater than 0:`, code);
      }
      resolve(result.stdout); //
    });

  });

};

export const getGitRemotes = (dirPath: string) : Promise<Array<string>> => {

  return new Promise((resolve) => {

    const remotes: string[] = [];
    const k = cp.spawn('bash');
    const cmd = `cd "${dirPath}" && git remote | xargs git remote get-url --all`;
    k.stdin.end(cmd);
    k.stdout.on('data', d => {
      remotes.push(String(d || '').trim());
    });
    k.once('exit', code => {
      if (code && code > 0) {
        log.warn(`Process (with cmd: '${cmd}') exited with code greater than 0:`, code);
      }
      resolve(remotes);
    });

  });

};
