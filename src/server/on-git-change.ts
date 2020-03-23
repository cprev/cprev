'use strict';

import {ChangePayload, GitPayload, ResultCallback} from "../types";
import {flattenDeep} from "../client/get-watchable-dirs";
import log from "bunion";
import * as uuid from 'uuid';
export const remoteURLToRepoPath = new Map<string, { pth: string }>();
export const repoPathToRemoteURL = new Map<string, { url: string }>();
export const repoIdToRepoPath = new Map<string, { pth: string }>();
export const repoIdToRemoteURL = new Map<string, { url: string }>();
export const repoPathToRepoId = new Map<string, { id: string }>();
export const remoteURLToRepoId = new Map<string, { id: string }>();

export const getGitRepoFromPath = (pth: string): string | null => {
  if (repoPathToRepoId.has(pth)) {
    return (repoPathToRepoId.get(pth) as { id: string }).id;
  }
  return null;
};

export const onGitChange = (p: GitPayload, cb: ResultCallback) => {

  const urls = new Set(flattenDeep([p.remote_urls]).filter(Boolean));

  let repoId : string = '';
  for (const u of urls) {
    if (remoteURLToRepoId.has(u)) {
      if (repoId) {
        log.warn('More than repo id:', repoId);
      }
      repoId = (remoteURLToRepoId.get(u) as {id: string}).id;
    }
  }

  if(!repoId){
    repoId = uuid.v4();
  }

  repoPathToRepoId.set(p.repo_path, {id: repoId});
  repoIdToRepoPath.set(repoId, {pth: p.repo_path});

  for (const u of urls) {
     remoteURLToRepoId.set(u,{id: repoId});
     repoIdToRemoteURL.set(repoId, {url: u});
     remoteURLToRepoPath.set(u, {pth: p.repo_path});
     repoPathToRemoteURL.set(p.repo_path, {url: u});
  }


  cb(null);

};
