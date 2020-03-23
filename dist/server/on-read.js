'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./cache");
const on_git_change_1 = require("./on-git-change");
function onRead(p, cb) {
    const repoId = on_git_change_1.getGitRepoIdFromPath(p.repo);
    if (!repoId) {
        return cb({
            result: 'error',
            error: 'repoId does not exist yet.'
        });
    }
    if (!cache_1.repos[repoId]) {
        cache_1.repos[repoId] = {
            repoId,
            url: p.repo,
            files: {}
        };
    }
    const userEmail = p.user_email;
    const repo = cache_1.repos[p.repo];
    if (!repo.files[p.file]) {
        repo.files[p.file] = [];
    }
    const lst = repo.files[p.file];
    const now = Date.now();
    while (true) {
        const first = lst[0];
        if (first && now - first.time > 72 * 60 * 60) {
            lst.shift();
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
    const set = new Set();
    const conflicts = lst.reduceRight((a, b) => {
        if (a.length > 3) {
            return a;
        }
        if (b.user_email === userEmail) {
            return a;
        }
        if (!set.has(b.user_email)) {
            a.push(b);
        }
        return a;
    }, []);
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
exports.onRead = onRead;
