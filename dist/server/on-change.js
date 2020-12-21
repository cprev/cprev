'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.onChange = void 0;
const cache_1 = require("./cache");
const on_git_change_1 = require("./on-git-change");
const bunion_1 = require("bunion");
function onChange(p, userUuid, cb) {
    const repoId = on_git_change_1.getGitRepoIdFromURL(p.repo_remotes);
    if (!repoId) {
        return cb({
            result: 'error',
            error: `repoId does not exist yet for path: '${p.repo}'`
        });
    }
    bunion_1.default.info('the repo id:', repoId);
    bunion_1.default.info('the user id:', userUuid);
    if (!cache_1.repos[repoId]) {
        cache_1.repos[repoId] = {
            repoId,
            url: repoId,
            files: {}
        };
    }
    const repo = cache_1.repos[repoId];
    if (!repo.files[p.file]) {
        repo.files[p.file] = [];
    }
    const lst = repo.files[p.file];
    bunion_1.default.info('current event list:', lst);
    const now = Date.now();
    while (true) {
        const first = lst[0];
        if (first && now - first.time > 24 * 60 * 60) {
            lst.shift();
            continue;
        }
        break;
    }
    while (true) {
        const mostRecent = lst[lst.length - 1];
        if (mostRecent && mostRecent.user_uuid === userUuid) {
            lst.pop();
            continue;
        }
        break;
    }
    const mostRecent = lst[lst.length - 1];
    lst.push({
        ...p,
        user_uuid: userUuid,
        time: now
    });
    if (!mostRecent) {
        return cb({
            result: 'no conflicts'
        });
    }
    if (mostRecent.user_uuid === userUuid) {
        bunion_1.default.error('this should never happen - matching user was still in the list');
        return cb({
            result: 'error',
            error: 'wrong user was found'
        });
    }
    const set = new Set();
    const conflicts = lst.reduceRight((a, b) => {
        if (a.length > 3) {
            return a;
        }
        if (b.user_uuid === userUuid) {
            return a;
        }
        if (!set.has(b.user_uuid)) {
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
exports.onChange = onChange;
