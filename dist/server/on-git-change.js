'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const bunion_1 = require("bunion");
const uuid = require("uuid");
exports.repoIdToRemoteURL = new Map();
exports.remoteURLToRepoId = new Map();
exports.getGitRepoIdFromURL = (urls) => {
    for (const u of utils_1.flattenDeep([urls]).filter(Boolean)) {
        if (exports.remoteURLToRepoId.has(u)) {
            return exports.remoteURLToRepoId.get(u).id;
        }
    }
    return null;
};
exports.onGitChange = (p, userUuid, cb) => {
    const urls = new Set(utils_1.flattenDeep([p.remote_urls]).filter(Boolean));
    let repoId = '';
    for (const u of urls) {
        if (exports.remoteURLToRepoId.has(u)) {
            if (repoId) {
                bunion_1.default.warn('More than one repo id:', repoId);
            }
            repoId = exports.remoteURLToRepoId.get(u).id;
        }
    }
    if (!repoId) {
        repoId = uuid.v4();
    }
    for (const u of urls) {
        exports.remoteURLToRepoId.set(u, { id: repoId });
        exports.repoIdToRemoteURL.set(repoId, { url: u });
    }
    [
        { remoteURLToRepoId: exports.remoteURLToRepoId },
        { repoIdToRemoteURL: exports.repoIdToRemoteURL },
    ]
        .forEach(v => {
        console.log(v);
    });
    cb(p);
};
