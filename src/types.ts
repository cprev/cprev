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
  files: {
    [key: string]: Array<CodeChange>
  }
}

export interface SocketMessage {
  type: 'read' | 'change' | 'git',
  reqUuid: string,
  val: ReadPayload | ChangePayload | GitPayload
}

export interface ChangePayload {
  repo: string,
  file: string,
  user_name: string,
  user_email: string
}

export interface GitPayload {
  repo: string,
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
  git_repo: string
}
