'use strict';

import {ChangePayload, CodeChange, ResultCallback} from "../types";
import {repos} from "./cache";

export function onRead(b: ChangePayload, cb: ResultCallback) {

  if (!repos[b.repo]) {
    repos[b.repo] = {
      url: b.repo,
      files: {}
    };
  }

  const repo = repos[b.repo];

  if (!repo.files[b.file]) {
    repo.files[b.file] = [];
  }

  const lst = repo.files[b.file];

  const now = Date.now();

  while (true) {
    const first = lst[0];
    if (first && now - first.time > 24 * 60 * 60) {
      lst.shift();
      continue;
    }
    break;
  }

  const mostRecent = lst[lst.length - 1];

  lst.push({
    ...b,
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

    if (!set.has(b.user_email)) {
      a.push(b);
    }

    return a;

  }, [] as Array<CodeChange>);

  return cb({
    result: 'conflict',
    conflicts
  });

}
