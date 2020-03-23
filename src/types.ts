'use strict';

export interface ResultCallback<T = any> {
  (val: T): void;
}

export interface Repos {
  [key: string]: Repo
}

export interface CodeChange {
  user_name: string,
  user_email: string,
  time: number
  file: string
}

export interface Repo {
  url: string,
  repoId: string,
  files: {
    [key: string]: Array<CodeChange>
  }
}

export interface SocketMessage {
  type: 'read' | 'change' | 'git',
  reqUuid?: string,
  resUuid?: string,
  val: ReadPayload | ChangePayload | GitPayload
}

export interface ChangePayload {
  repo: string,
  file: string,
  user_name: string,
  user_email: string
}

export interface GitPayload {
  repo_path: string,
  remote_urls: Array<string>,
  // remote_urls: {
  //   [key: string]: boolean
  // },
  branch: string,
  trackedFiles: {
    [key:string]: true
  }
}

export interface ReadPayload {
  repo: string,
  file: string,
  user_name: string,
  user_email: string
}

export interface WatchDir {
  dirpath: string,
  git_repo: string,
  git_remotes: Array<string>
}
