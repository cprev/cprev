'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./cache");
function onChange(p, cb) {
    if (!cache_1.repos[p.repo]) {
        cache_1.repos[p.repo] = {
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
        if (first && now - first.time > 24 * 60 * 60) {
            lst.shift();
            continue;
        }
        break;
    }
    while (true) {
        const mostRecent = lst[lst.length - 1];
        if (mostRecent && mostRecent.user_email === userEmail) {
            lst.pop();
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
    if (mostRecent.user_email === userEmail) {
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
exports.onChange = onChange;
