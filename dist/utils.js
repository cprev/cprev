'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cp = require("child_process");
const bunion_1 = require("bunion");
const path = require("path");
exports.hasGitGrandparent = (pth) => {
    const dirname = path.dirname(pth);
    if (dirname.endsWith('/.git')) {
        return true;
    }
    if (dirname === pth) {
        return false;
    }
    return exports.hasGitGrandparent(dirname);
};
exports.flattenDeep = (a) => {
    return a.reduce((acc, val) => Array.isArray(val) ? acc.concat(exports.flattenDeep(val)) : acc.concat(val), []);
};
exports.mkdirSafe = (dir) => {
    try {
        fs.mkdirSync(dir);
    }
    catch (err) {
    }
};
exports.getGitRepoPath = (dirPath) => {
    bunion_1.default.info('the dirpath:', dirPath);
    return new Promise((resolve) => {
        const k = cp.spawn('bash');
        const cmd = `cd "${dirPath}" && git rev-parse --show-toplevel`;
        k.stdin.end(cmd);
        const result = {
            stdout: ''
        };
        k.stdout.on('data', d => {
            result.stdout += String(d || '').trim();
        });
        k.once('exit', code => {
            if (code && code > 0) {
                bunion_1.default.warn(`Process (with cmd: '${cmd}') exited with code greater than 0:`, code);
            }
            resolve(result.stdout);
        });
    });
};
exports.runGitDiffForCommit = (dirPath, commitId, relPath) => {
    return new Promise((resolve) => {
        const k = cp.spawn('bash');
        const cmd = `cd "${dirPath}" && git diff --quiet ${commitId}:${relPath} ${relPath}`;
        k.stdin.end(cmd);
        k.stderr.pipe(process.stderr);
        k.stdout.pipe(process.stdout);
        k.once('exit', code => {
            if (code && code > 0) {
                bunion_1.default.warn(`Process (with cmd: '${cmd}') exited with non-zero code:`, code);
            }
            resolve({
                code: code || 0
            });
        });
    });
};
exports.fetchFromRemote = (dirPath, remote) => {
    return new Promise((resolve) => {
        const k = cp.spawn('bash');
        const cmd = `cd "${dirPath}" && git fetch ${remote}`;
        k.stdin.end(cmd);
        k.stderr.pipe(process.stderr);
        k.once('exit', code => {
            if (code && code > 0) {
                bunion_1.default.warn(`Process (with cmd: '${cmd}') exited with non-zero code:`, code);
            }
            resolve(null);
        });
    });
};
exports.getGitRemotes = (dirPath) => {
    return new Promise((resolve) => {
        const remotes = [];
        const k = cp.spawn('bash');
        const cmd = `cd "${dirPath}" && git remote | xargs git remote get-url --all`;
        k.stdin.end(cmd);
        k.stdout.on('data', d => {
            remotes.push(String(d || '').trim());
        });
        k.once('exit', code => {
            if (code && code > 0) {
                bunion_1.default.warn(`Process (with cmd: '${cmd}') exited with code greater than 0:`, code);
            }
            resolve(remotes);
        });
    });
};
