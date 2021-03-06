'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLocalChange = void 0;
const utils_1 = require("../utils");
const bunion_1 = require("bunion");
const cp = require("child_process");
const json_stream_parser_1 = require("@oresoftware/json-stream-parser");
const gitLogFormat = `{"hash":"%H","author_email":"%ae"}`;
exports.handleLocalChange = (event, i, fullPath, filename) => {
    return utils_1.getGitRepoPath(i.dirpath)
        .then((v) => {
        console.log('result::', v);
        if (String(v || '').trim() === '') {
            return {
                git_repo: null,
                remotes: []
            };
        }
        return utils_1.getGitRemotes(i.dirpath).then(remotes => {
            return {
                git_repo: v,
                remotes
            };
        });
    })
        .then(v => {
        if (v.git_repo === null) {
            bunion_1.default.warn('the following file does not appear to be within a git repo:', fullPath);
            return;
        }
        bunion_1.default.info('updating for git:', v);
        return Promise.all(v.remotes.map(val => utils_1.fetchFromRemote(v.git_repo, val))).then(_ => {
            return {
                git_repo: v.git_repo
            };
        });
    })
        .then(v => {
        return new Promise((resolve) => {
            const k = cp.spawn('bash');
            const cmd = `git log --all --since=3.days --max-count=500 --pretty='${gitLogFormat}';`;
            k.stdin.end(cmd);
            let p = Promise.resolve();
            const authors = new Set();
            k.stdout.pipe(new json_stream_parser_1.default()).on('data', d => {
                const email = d.author_email;
                const hash = d.hash;
                p = p.then(v => {
                    if (authors.has(email)) {
                        return { code: 0 };
                    }
                    if (authors.size > 3) {
                        return { code: 0 };
                    }
                    return utils_1.runGitDiffForCommit(v.git_repo, hash, filename);
                })
                    .then(({ code }) => {
                    if (code > 0) {
                        authors.add(email);
                    }
                });
            });
            k.once('exit', code => {
                p.then(() => {
                    resolve();
                });
            });
        });
    });
};
