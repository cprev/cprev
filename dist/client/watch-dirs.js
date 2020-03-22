'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const bunion_1 = require("bunion");
const client_conn_1 = require("./client-conn");
const cp = require("child_process");
const path = require("path");
const uuid = require("uuid");
const agent_1 = require("./agent");
const doWrite = (s, v) => {
    if (!s.writable) {
        bunion_1.default.warn('44558c07-2b13-4f9c-9f3c-7e524e11fe07: socket is not writable.');
        return;
    }
    bunion_1.default.info("fb224b51-bb55-45d3-aa46-8f3d2c6ce55d writing payload:", v);
    s.write(JSON.stringify(v) + '\n', 'utf8');
};
let callable = true;
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
const updateForGit = (fullPath) => {
    return new Promise((resolve) => {
        const id = uuid.v4();
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
exports.watchDirs = (dirs) => {
    if (!callable) {
        return;
    }
    callable = false;
    const timers = new Map();
    console.log('dirs.length:', dirs.length);
    for (const i of dirs) {
        let p = Promise.resolve();
        fs.watch(i.dirpath, (event, filename) => {
            const fullPath = path.resolve(i.dirpath + '/' + filename);
            if (hasGitGrandparent(fullPath)) {
                p = p.then(() => updateForGit(fullPath));
                return;
            }
            bunion_1.default.info('filesystem event:', event, fullPath);
            if (timers.has(fullPath)) {
                clearTimeout(timers.get(fullPath));
            }
            timers.set(fullPath, setTimeout(() => {
                if (i.git_repo) {
                    return client_conn_1.getConnection().then(v => {
                        doWrite(v, {
                            type: event === 'change' ? 'change' : 'read',
                            reqUuid: uuid.v4(),
                            val: {
                                repo: i.git_repo,
                                file: fullPath,
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
                                user_email: 'alex@oresoftware.com',
                                user_name: 'alex'
                            }
                        });
                    });
                });
            }, 2500));
        });
    }
};
