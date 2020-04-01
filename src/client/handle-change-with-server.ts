import {getGitRemotes, getGitRepoPath} from "../utils";
import log from "bunion";
import config from "../.cprev.conf";
import {getConnection} from "./client-conn";
import * as uuid from "uuid";
import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";
import {GitPayload, SocketMessage, WatchDir} from "../types";
import {cache} from "./agent";
import * as net from "net";

const doWrite = (s: net.Socket, v: Partial<SocketMessage>) => {

  if (!s.writable) {
    log.warn('44558c07-2b13-4f9c-9f3c-7e524e11fe07: socket is not writable.');
    return;
  }

  if (!(v && typeof v === 'object')) {
    log.warn('payload is not an object:', v);
    return;
  }

  if (v.resUuid) {
    log.warn('refusing to write to socket since payload has resUuid property:', v);
    return;
  }

  if (!v.reqUuid) {
    v.reqUuid = uuid.v4();
  }

  v.userUuid = config.userUuid;

  log.info("fb224b51-bb55-45d3-aa46-8f3d2c6ce55d writing payload:", v);
  s.write(JSON.stringify(v) + '\n', 'utf8');
};

const updateForGit = (p: GitPayload) => {

  const id = uuid.v4();

  getConnection().then(s => {
    doWrite(s, {
      type: 'git',
      reqUuid: id,
      val: p
    });
  });

  return new Promise((resolve) => {

    let timedout = false;
    const to = setTimeout(() => {
      timedout = true;
      cache.resolutions.delete(id);
      resolve(null);
    }, 1500);

    cache.resolutions.set(id, () => {
      cache.resolutions.delete(id);
      if (timedout) {
        return;
      }
      clearTimeout(to);

      resolve(null);
    });

  });
};

export const handleChangeWithServer =
  (event: string, i: WatchDir, fullPath: string, filename: string): Promise<any> => {

  return getGitRepoPath(i.dirpath)
    .then(v => {

      console.log('result::', v); //

      if (String(v || '').trim() === '') {
        return null;
      }

      return getGitRemotes(i.dirpath).then(remotes => {
        return {
          git_repo: v,
          remotes
        }
      })
    })
    .then(v => {

      if (v === null) {
        log.warn('the following file does not appear to be within a git repo:', fullPath);
        return;
      }

      log.info('updating for git:', v); //

      return updateForGit({
        repo_path: v.git_repo,
        remote_urls: v.remotes,
        user_uuid: config.userUuid,
        branch: null as any,
        trackedFiles: null as any
      })
        .then(() => {
          return getConnection().then(s => {
            doWrite(s, {
              type: event === 'change' ? 'change' : 'read',
              val: {
                repo: i.git_repo,
                repo_remotes: v.remotes,
                user_uuid: config.userUuid,
                file: fullPath,
                user_email: 'alex@oresoftware.com',
                user_name: 'alex'
              }
            });
          });  //
        });

    });

  /// old colde
  if (i.git_repo) {
    return getConnection().then(v => {
      doWrite(v, {
        type: event === 'change' ? 'change' : 'read',
        reqUuid: uuid.v4(),
        val: {
          repo: i.git_repo,
          repo_remotes: [], // TODO fill this in
          file: fullPath,
          user_uuid: config.userUuid,
          user_email: 'alex@oresoftware.com',
          user_name: 'alex'
        }
      });
    });
  }

  const k = cp.spawn('bash');

  k.stdin.end(`
           cd "$(dirname "${filename}")" && git rev-parse --show-toplevel
        `);

  const d = {
    stdout: '',
    stderr: ''
  };

  k.stderr.on('data', d => {
    d.stderr = String(d || '').trim();
  });

  k.stdout.on('data', d => {
    d.stdout = String(d || '').trim();
  });

  k.once('exit', code => {
    ///

    if (code && code > 0) {
      log.error('33e68dd9-5842-41c2-83e0-65d43e68cb27: git/bash child process exited with non zero code.');
      log.error('058b717c-94a3-49a9-b6e3-a162beb9d96b: stderr:', d.stderr);
      return;
    }

    if (!(d.stdout && d.stdout.startsWith('/'))) {
      log.warn('715b9f6e-7119-43ae-9a02-9b0c8c1f52dc: Not a filepath:', d.stdout);
      return;
    }

    try {
      var stats = fs.statSync(d.stdout);
    }
    catch (err) {
      log.error('8781b643-b682-4e0b-a29b-931ce7df7376: Could not stat this path:', d.stdout);
      return;
    }

    if (!stats.isDirectory()) {
      log.error('954d918f-826f-4524-a7e0-683ea32e4208: The stats call says this is not a git dir:', d.stdout);
      return;
    }

    getConnection().then(v => {
      doWrite(v, {
        type: event === 'change' ? 'change' : 'read',
        reqUuid: uuid.v4(),
        val: {
          repo: i.git_repo,
          file: fullPath,
          user_uuid: config.userUuid,
          repo_remotes: [], // TODO fill this in
          user_email: 'alex@oresoftware.com',
          user_name: 'alex'
        }
      });

    });

  });

}
