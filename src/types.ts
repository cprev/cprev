'use strict';

export interface ResultCallback {
  (val: any): void;
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
    [key:string]: Array<CodeChange>
  }
}

export interface ChangePayload {
  repo: string,
  file: string,
  user_name: string,
  user_email: string
}

export interface ReadPayload {
  repo: string,
  file: string,
  user_name: string,
  user_email: string
}
