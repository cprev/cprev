'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const get_watchable_dirs_1 = require("../client/get-watchable-dirs");
const bunion_1 = require("bunion");
const uuid = require("uuid");
exports.remoteURLToRepoPath = new Map();
exports.repoPathToRemoteURL = new Map();
exports.repoIdToRepoPath = new Map();
exports.repoIdToRemoteURL = new Map();
exports.remoteURLToRepoId = new Map();
exports.getGitRepoIdFromURL = (urls) => {
    for (const u of get_watchable_dirs_1.flattenDeep([urls]).filter(Boolean)) {
        if (exports.remoteURLToRepoId.has(u)) {
            return exports.remoteURLToRepoId.get(u).id;
        }
    }
    return null;
};
exports.onGitChange = (p, userUuid, cb) => {
    const urls = new Set(get_watchable_dirs_1.flattenDeep([p.remote_urls]).filter(Boolean));
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
    exports.repoIdToRepoPath.set(repoId, { pth: p.repo_path });
    for (const u of urls) {
        exports.remoteURLToRepoId.set(u, { id: repoId });
        exports.repoIdToRemoteURL.set(repoId, { url: u });
        exports.remoteURLToRepoPath.set(u, { pth: p.repo_path });
        exports.repoPathToRemoteURL.set(p.repo_path, { url: u });
    }
    [
        { repoPathToRemoteURL: exports.repoPathToRemoteURL },
        { remoteURLToRepoPath: exports.remoteURLToRepoPath },
        { remoteURLToRepoId: exports.remoteURLToRepoId },
        { repoIdToRemoteURL: exports.repoIdToRemoteURL },
        { repoIdToRepoPath: exports.repoIdToRepoPath },
    ]
        .forEach(v => {
        console.log(v);
    });
    cb(p);
};