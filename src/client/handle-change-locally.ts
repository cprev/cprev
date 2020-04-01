'use strict';

import {WatchDir} from "../types";
import {fetchFromRemote, getGitRemotes, getGitRepoPath, runGitDiffForCommit} from "../utils";
import log from "bunion";
import * as cp from 'child_process';
import createParser from "./git-log-parser";
import JSONParser from "@oresoftware/json-stream-parser";

const gitLogFormat = `{"hash":"%H","author_email":"%ae"}`;

export const handleLocalChange = (event: string, i: WatchDir, fullPath: string, filename: string): Promise<any> => {

  return getGitRepoPath(i.dirpath)
    .then((v: any) => {

      console.log('result::', v); //

      if (String(v || '').trim() === '') {
        return {
          git_repo: null as any,
          remotes: []
        };
      }

      return getGitRemotes(i.dirpath).then(remotes => {
        return {
          git_repo: v,
          remotes
        }
      })
    })
    .then(v => {

      if (v.git_repo === null) {
        log.warn('the following file does not appear to be within a git repo:', fullPath);
        return;
      }

      log.info('updating for git:', v); //

      return Promise.all(
        v.remotes.map(val => fetchFromRemote(v.git_repo, val))
      ).then(_ => {
        return {
          git_repo: v.git_repo
        }
      })
    })
    .then(v => {

      return new Promise((resolve) => {

        const k = cp.spawn('bash');
        const cmd = `git log --all --since=3.days --max-count=500 --pretty='${gitLogFormat}';`;
        k.stdin.end(cmd);

        let p = Promise.resolve() as Promise<any>;
        const authors = new Set();

        k.stdout.pipe(new JSONParser()).on('data', d => {

          const email = d.author_email;
          const hash = d.hash;

          p = p.then(v => {

            if (authors.has(email)) {
              return {code: 0};
            }

            return runGitDiffForCommit(v.git_repo, hash, filename)
          })
            .then(({code}) => {
            if (code > 0) {
              authors.add(email);
            }
          });

        });

        k.once('exit', code => {

          p.then(() =>{
            resolve();
          })
        });

      });

    });
};
