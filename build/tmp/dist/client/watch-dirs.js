'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const bunion_1 = require("bunion");
const client_conn_1 = require("./client-conn");
const cp = require("child_process");
const path = require("path");
const uuid = require("uuid");
const agent_1 = require("./agent");
const utils_1 = require("../utils");
const _cprev_conf_js_1 = require("../.cprev.conf.js");
const doWrite = (s, v) => {
    if (!s.writable) {
        bunion_1.default.warn('44558c07-2b13-4f9c-9f3c-7e524e11fe07: socket is not writable.');
        return;
    }
    if (!(v && typeof v === 'object')) {
        bunion_1.default.warn('payload is not an object:', v);
        return;
    }
    if (v.resUuid) {
        bunion_1.default.warn('refusing to write to socket since payload has resUuid property:', v);
        return;
    }
    if (!v.reqUuid) {
        v.reqUuid = uuid.v4();
    }
    v.userUuid = _cprev_conf_js_1.default.userUuid;
    bunion_1.default.info("fb224b51-bb55-45d3-aa46-8f3d2c6ce55d writing payload:", v);
    s.write(JSON.stringify(v) + '\n', 'utf8');
};
const hasGitGrandparent = (pth) => {
    const dirname = path.dirname(pth);
    if (dirname.endsWith('/.git')) {
        return true;
    }
    if (dirname === pth) {
        return false;
    }
    return hasGitGrandparent(dirname);
};
const updateForGit = (p) => {
    const id = uuid.v4();
    client_conn_1.getConnection().then(s => {
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
            agent_1.cache.resolutions.delete(id);
            resolve(null);
        }, 1500);
        agent_1.cache.resolutions.set(id, () => {
            agent_1.cache.resolutions.delete(id);
            if (timedout) {
                return;
            }
            clearTimeout(to);
            resolve(null);
        });
    });
};
exports.watchedDirs = new Set();
exports.dirToWatcher = new Map();
exports.watchDirs = (dirs) => {
    const timers = new Map();
    console.log('dirs.length:', dirs.length);
    for (let v of dirs) {
        bunion_1.default.info(v);
    }
    for (const i of dirs) {
        let p = Promise.resolve();
        const w = fs.watch(i.dirpath);
        w.on('change', (event, filename) => {
            const fullPath = path.resolve(i.dirpath + '/' + filename);
            if (hasGitGrandparent(fullPath)) {
                bunion_1.default.warn('This file/dir is within a ".git" dir?:', fullPath);
                return;
            }
            bunion_1.default.info('filesystem event:', event, fullPath);
            if (timers.has(fullPath)) {
                clearTimeout(timers.get(fullPath));
            }
            const now = Date.now();
            timers.set(fullPath, setTimeout(() => {
                return p = p.then(() => {
                    return utils_1.getGitRepoPath(i.dirpath)
                        .then(v => {
                        console.log('result::', v);
                        if (String(v || '').trim() === '') {
                            return null;
                        }
                        return utils_1.getGitRemotes(i.dirpath).then(remotes => {
                            return {
                                git_repo: v,
                                remotes
                            };
                        });
                    })
                        .then(v => {
                        if (v === null) {
                            bunion_1.default.warn('the following file does not appear to be within a git repo:', fullPath);
                            return;
                        }
                        bunion_1.default.info('updating for git:', v);
                        return updateForGit({
                            repo_path: v.git_repo,
                            remote_urls: v.remotes,
                            user_uuid: _cprev_conf_js_1.default.userUuid,
                            branch: null,
                            trackedFiles: null
                        })
                            .then(() => {
                            return client_conn_1.getConnection().then(s => {
                                doWrite(s, {
                                    type: event === 'change' ? 'change' : 'read',
                                    val: {
                                        repo: i.git_repo,
                                        repo_remotes: v.remotes,
                                        user_uuid: _cprev_conf_js_1.default.userUuid,
                                        file: fullPath,
                                        user_email: 'alex@oresoftware.com',
                                        user_name: 'alex'
                                    }
                                });
                            });
                        });
                    });
                });
                if (i.git_repo) {
                    return client_conn_1.getConnection().then(v => {
                        doWrite(v, {
                            type: event === 'change' ? 'change' : 'read',
                            reqUuid: uuid.v4(),
                            val: {
                                repo: i.git_repo,
                                repo_remotes: [],
                                file: fullPath,
                                user_uuid: _cprev_conf_js_1.default.userUuid,
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
                    if (code && code > 0) {
                        bunion_1.default.error('33e68dd9-5842-41c2-83e0-65d43e68cb27: git/bash child process exited with non zero code.');
                        bunion_1.default.error('058b717c-94a3-49a9-b6e3-a162beb9d96b: stderr:', d.stderr);
                        return;
                    }
                    if (!(d.stdout && d.stdout.startsWith('/'))) {
                        bunion_1.default.warn('715b9f6e-7119-43ae-9a02-9b0c8c1f52dc: Not a filepath:', d.stdout);
                        return;
                    }
                    try {
                        var stats = fs.statSync(d.stdout);
                    }
                    catch (err) {
                        bunion_1.default.error('8781b643-b682-4e0b-a29b-931ce7df7376: Could not stat this path:', d.stdout);
                        return;
                    }
                    if (!stats.isDirectory()) {
                        bunion_1.default.error('954d918f-826f-4524-a7e0-683ea32e4208: The stats call says this is not a git dir:', d.stdout);
                        return;
                    }
                    client_conn_1.getConnection().then(v => {
                        doWrite(v, {
                            type: event === 'change' ? 'change' : 'read',
                            reqUuid: uuid.v4(),
                            val: {
                                repo: i.git_repo,
                                file: fullPath,
                                user_uuid: _cprev_conf_js_1.default.userUuid,
                                repo_remotes: [],
                                user_email: 'alex@oresoftware.com',
                                user_name: 'alex'
                            }
                        });
                    });
                });
            }, 2500));
        });
        w.once('close', () => {
            exports.watchedDirs.delete(i.dirpath);
            w.removeAllListeners();
        });
        w.once('error', err => {
            bunion_1.default.warn('dir watching error:', err, 'at path:', i.dirpath);
            w.close();
        });
        exports.dirToWatcher.set(i.dirpath, w);
    }
};
