'use strict';

import {ChangePayload, CodeChange, ResultCallback} from "../types";
import {repos} from "./cache";
import {getGitRepoIdFromURL} from "./on-git-change";
import log from "bunion";


export function onRead(p: ChangePayload, userUuid: string, cb: ResultCallback) {

  const repoId = getGitRepoIdFromURL(p.repo_remotes);

  if(!repoId){
    return cb({
      result: 'error',
      error: `repoId does not exist yet for path: '${p.repo}'` //
    });
  }

  log.info('the repo id:', repoId);
  log.info('the user id:', userUuid);

  if (!repos[repoId]) {
    repos[repoId] = {
      repoId,
      url: p.repo,
      files: {}
    };
  }

  const repo = repos[repoId];

  if (!repo.files[p.file]) {
    repo.files[p.file] = [];
  }

  const lst = repo.files[p.file];

  log.info('current event list:', lst);

  const now = Date.now();

  while (true) {
    const first = lst[0];
    if (first && now - first.time > 72 * 60 * 60) {
      lst.shift();
      continue;
    }
    break;
  }

  const mostRecent = lst[lst.length - 1];

  lst.push({
    ...p,
    user_uuid: userUuid,
    time: now
  });

  if (!mostRecent) {
    return cb({
      result: 'no conflicts'
    });
  }

  const set = new Set();

  const conflicts = lst.reduceRight((a, b) => {

    if (a.length > 3) {
      return a;
    }

    if(b.user_uuid === userUuid){
      return a;
    }

    if (!set.has(b.user_uuid)) {
      a.push(b);
    }

    return a;

  }, [] as Array<CodeChange>);


  if (conflicts.length < 1) {
    return cb({
      result: 'no conflicts'
    });
  }

  return cb({
    result: 'conflict',
    conflicts
  });

}
