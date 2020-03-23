'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const async = require("async");
const path = require("path");
const bunion_1 = require("bunion");
const fs = require("fs");
const constants_1 = require("../constants");
const cp = require("child_process");
exports.flattenDeep = (a) => {
    return a.reduce((acc, val) => Array.isArray(val) ? acc.concat(exports.flattenDeep(val)) : acc.concat(val), []);
};
let callable = true;
exports.getGitRemote = (isGitRepo, cb) => {
    const remotes = [];
    if (!isGitRepo) {
        return process.nextTick(cb, null, remotes);
    }
    const k = cp.spawn('bash');
    const cmd = `git remote | xargs git remote get-url --all`;
    k.stdin.end(cmd);
    k.stdout.on('data', d => {
        remotes.push(String(d || '').trim());
    });
    k.once('exit', code => {
        if (code && code > 0) {
            bunion_1.default.warn(`Process (with cmd: '${cmd}') exited with code greater than 0:`, code);
        }
        cb(null, remotes);
    });
};
exports.getWatchableDirs = (config, cb) => {
    if (!callable) {
        throw 'Why call me twice?';
    }
    callable = false;
    const paths = exports.flattenDeep([config.codeRoots]).map(v => path.resolve(v));
    const uniquePaths = Array.from(new Set(paths));
    const q = async.queue((task, cb) => task(cb), 15);
    const alreadySeen = new Set();
    const uniqueFolders = new Set();
    const goThroughDir = (dir, isWatchingNow, relevantGitRepo) => {
        if (alreadySeen.has(dir)) {
            return;
        }
        alreadySeen.add(dir);
        for (let ignore of constants_1.ignorePathsRegex) {
            if (ignore.test(path.resolve(dir))) {
                bunion_1.default.debug('path ignored:', dir);
                return;
            }
            if (ignore.test(path.resolve(dir + '/'))) {
                bunion_1.default.debug('path ignored:', dir);
                return;
            }
            if (ignore.test(path.resolve(dir + '/') + '/')) {
                bunion_1.default.debug('path ignored:', dir);
                return;
            }
        }
        q.push(cb => {
            fs.stat(dir, (err, stats) => {
                if (err) {
                    return cb(null);
                }
                if (!stats.isDirectory()) {
                    return cb(null);
                }
                try {
                    var cprevjs = require(path.resolve(dir + '/.cprev.js'));
                    bunion_1.default.info(dir, { cprevjs });
                    isWatchingNow = true;
                }
                catch (err) {
                }
                const potentialGitFolder = path.resolve(dir + '/.git');
                fs.stat(potentialGitFolder, (err, stats) => {
                    let isGitRepo = false;
                    if (stats && stats.isDirectory()) {
                        isGitRepo = true;
                        relevantGitRepo = potentialGitFolder;
                    }
                    exports.getGitRemote(isGitRepo, remotes => {
                        if (isWatchingNow) {
                            uniqueFolders.add({ dirpath: dir, git_repo: relevantGitRepo, git_remotes: remotes });
                        }
                        fs.readdir(dir, (err, results) => {
                            cb(null);
                            if (err) {
                                bunion_1.default.warn('bb97184f-4a07-4acd-b7bc-59dc8e5fb0e4:', err);
                                return cb(null);
                            }
                            for (const v of results) {
                                goThroughDir(path.resolve(dir + '/' + v), isWatchingNow, relevantGitRepo);
                            }
                        });
                    });
                });
            });
        });
    };
    q.error(err => {
        bunion_1.default.error(err);
    });
    q.drain(() => {
        cb(null, Array.from(uniqueFolders));
    });
    for (const p of uniquePaths) {
        goThroughDir(p, false, path.normalize('/tmp/unknown/git/repo/path'));
    }
};
