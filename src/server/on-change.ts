'use strict';

import {CodeChange, ChangePayload, ResultCallback} from "../types";
import {repos} from "./cache";
import {getGitRepoIdFromURL} from "./on-git-change";

export function onChange(p: ChangePayload, userUuid: string, cb: ResultCallback) {

  const repoId = getGitRepoIdFromURL(p.repo_remotes);

  if (!repoId) {
    return cb({
      result: 'error',
      error: `repoId does not exist yet for path: '${p.repo}'`
    });
  }

  if (!repos[repoId]) {
    repos[repoId] = {
      repoId,
      url: repoId,
      files: {}
    };
  }

  const repo = repos[repoId];    ////

  if (!repo.files[p.file]) {
    repo.files[p.file] = [];
  }

  const lst = repo.files[p.file];
  const now = Date.now();

  while (true) {
    // we remove old changes from the beginning of queue
    // mostly just to clean up memory
    const first = lst[0];
    if (first && now - first.time > 24 * 60 * 60) {
      lst.shift();
      continue;
    }
    break;
  }

  while (true) {
    // we remove all existing changes from current user from the end of queue
    const mostRecent = lst[lst.length - 1];
    if (mostRecent && mostRecent.user_uuid === userUuid) {
      lst.pop();
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

  if (mostRecent.user_uuid === userUuid) {
    // current user made the most recent change, so no conflicts
    return cb({
      result: 'no conflicts'
    });
  }

  const set = new Set();

  const conflicts = lst.reduceRight((a, b) => {

    if (a.length > 3) {
      // we only send back the 4 most recent changes
      return a;
    }

    if (b.user_uuid === userUuid) {
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
