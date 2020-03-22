'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./cache");
function onRead(b, cb) {
    if (!cache_1.repos[b.repo]) {
        cache_1.repos[b.repo] = {
            url: b.repo,
            files: {}
        };
    }
    const repo = cache_1.repos[b.repo];
    if (!repo.files[b.file]) {
        repo.files[b.file] = [];
    }
    const lst = repo.files[b.file];
    const now = Date.now();
    while (true) {
        const first = lst[0];
        if (first && now - first.time > 24 * 60 * 60) {
            lst.shift();
            continue;
        }
        break;
    }
    const mostRecent = lst[lst.length - 1];
    lst.push({
        ...b,
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
        if (!set.has(b.user_email)) {
            a.push(b);
        }
        return a;
    }, []);
    return cb({
        result: 'conflict',
        conflicts
    });
}
exports.onRead = onRead;
