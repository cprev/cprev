'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const async = require("async");
const path = require("path");
const bunion_1 = require("bunion");
const fs = require("fs");
exports.flattenDeep = (a) => {
    return a.reduce((acc, val) => Array.isArray(val) ? acc.concat(exports.flattenDeep(val)) : acc.concat(val), []);
};
exports.watchFiles = (config, cb) => {
    const paths = exports.flattenDeep([config.codeRoots]).map(v => path.resolve(v));
    const uniquePaths = Array.from(new Set(paths));
    const q = async.queue((task, cb) => task(cb), 15);
    const alreadySeen = new Set();
    const uniqueFolders = new Set();
    const goThroughDir = (dir, isWatchingNow) => {
        if (alreadySeen.has(dir)) {
            return process.nextTick(cb);
        }
        alreadySeen.add(dir);
        q.push(cb => {
            fs.stat(dir, (err, stats) => {
                if (err) {
                    bunion_1.default.warn('7ae3f105-a04e-406f-846c-2a45f8515c1b:', err);
                    return cb(null);
                }
                if (!stats.isDirectory()) {
                    return cb(null);
                }
                if (alreadySeen.has(dir)) {
                    return cb(null);
                }
                alreadySeen.add(dir);
                try {
                    var cprevjs = require(path.resolve(dir + '/.cprev.js'));
                    isWatchingNow = true;
                }
                catch (err) {
                }
                if (isWatchingNow) {
                    uniqueFolders.add(dir);
                }
                fs.readdir(dir, (err, results) => {
                    cb(null);
                    if (err) {
                        bunion_1.default.warn('bb97184f-4a07-4acd-b7bc-59dc8e5fb0e4:', err);
                        return cb(null);
                    }
                    for (const v of results) {
                        goThroughDir(path.resolve(dir + '/' + v), isWatchingNow);
                    }
                });
            });
        });
    };
    q.error(err => {
        bunion_1.default.error(err);
    });
    q.drain(() => {
        cb(null);
    });
};
