'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const bunion_1 = require("bunion");
const path = require("path");
const utils_1 = require("../utils");
const handle_change_with_server_1 = require("./handle-change-with-server");
exports.watchedDirs = new Set();
exports.dirToWatcher = new Map();
const network = 'network:';
const local = 'local:';
exports.watchDirs = (dirs) => {
    const timers = new Map();
    console.log('dirs.length:', dirs.length);
    for (let v of dirs) {
        bunion_1.default.info(v);
    }
    for (const i of dirs) {
        let p1 = Promise.resolve();
        let p2 = Promise.resolve();
        const w = fs.watch(i.dirpath);
        w.on('change', (event, filename) => {
            const fullPath = path.resolve(i.dirpath + '/' + filename);
            if (utils_1.hasGitGrandparent(fullPath)) {
                bunion_1.default.warn('This file/dir is within a ".git" dir?:', fullPath);
                return;
            }
            bunion_1.default.info('filesystem event:', event, fullPath);
            if (timers.has(network + fullPath)) {
                clearTimeout(timers.get(network + fullPath));
            }
            if (timers.has(local + fullPath)) {
                clearTimeout(timers.get(local + fullPath));
            }
            const now = Date.now();
            timers.set(local + fullPath, setTimeout(() => {
                return p2 = p2.then(() => {
                    return handle_change_with_server_1.handleChangeWithServer(event, i, fullPath, filename);
                });
            }, 3000));
            timers.set(network + fullPath, setTimeout(() => {
                return p1 = p1.then(() => {
                    return handle_change_with_server_1.handleChangeWithServer(event, i, fullPath, filename);
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
