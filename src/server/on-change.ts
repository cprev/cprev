'use strict';

import {CodeChange, ChangePayload, ResultCallback} from "../types";
import {repos} from "./cache";

export function onChange(p: ChangePayload, cb: ResultCallback) {

  if (!repos[p.repo]) {
    repos[p.repo] = {
      url: p.repo,
      files: {}
    };
  }

  const userEmail = p.user_email;
  const repo = repos[p.repo];

  if (!repo.files[p.file]) {
    repo.files[p.file] = [];
  }

  const lst = repo.files[p.file];
  const now = Date.now();

  while (true) {
    const first = lst[0];
    if (first && now - first.time > 24 * 60 * 60) {
      lst.shift();
      continue;
    }
    break;
  }


  while(true){
    const mostRecent = lst[lst.length - 1];
    if (mostRecent && mostRecent.user_email === userEmail) {
      lst.pop();
      continue;
    }
    break;
  }

  const mostRecent = lst[lst.length - 1];

  lst.push({
    ...p,
    time: now
  });

  if (!mostRecent) {
    return cb({
      result: 'no conflicts'
    });
  }

  if(mostRecent.user_email === userEmail){
    // current user made the most recent change, so no conflicts
    return cb({
      result: 'no conflicts'
    });
  }

  const set = new Set();  //////

  const conflicts = lst.reduceRight((a, b) => {

    if (a.length > 3) {
      // we only send back the 4 most recent changes
      return a;
    }

    if(b.user_email === userEmail){
      return a;
    }

    if (!set.has(b.user_email)) {
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
